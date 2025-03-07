<template>
  <div>
    <!-- 隐藏的 Canvas 用于图像处理 -->
    <canvas ref="floorCanvas" style="display: none"></canvas>

  <div>Please manually switch the corresponding floor to view the route!</div>
    <div
      :style="{ height: props.visibleStart ? '300px' : 'calc(100vh - 330px)'}"
      id="map"
      ref="mapContainer"
      class="map"
    >
      <select class="floor-selector" v-model="currentFloor" @change="changeFloor(currentFloor)">
        <option v-for="floor in floors" :key="floor" :value="floor">
          {{ floor }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { ref, onMounted, onUnmounted, watch } from 'vue'
import KalmanFilter from 'kalmanjs'
import floor1 from '../imgs/floor1.png'
import floor2 from '../imgs/floor2.jpg'
import floor3 from '../imgs/floor3.jpg'
import floor4 from '../imgs/floor4.jpg'
import floor5 from '../imgs/floor5.jpg'
import floor6 from '../imgs/floor6.jpg'
import arrowIcon from '../imgs/user.svg'
import { useRoute } from 'vue-router'
import PathFinding from 'pathfinding'
import { ElMessageBox } from 'element-plus' // 如果使用 Element Plus
const props = defineProps({
  dataDetail: Object,
  isSelecting: {
    type: Boolean,
    default: false,
  },
  isNavigating: {
    type: Boolean,
    default: false,
  },
  roomLat: Number,
  roomLon: Number,
  visibleStart: Boolean,
})

const emit = defineEmits(['pointSelected'])
console.log(props.dataDetail, '===> props.roomLon')

const map = ref(null)
const marker = ref(null)
const roomMarker = ref(null)
const navigationPath = ref(null)
const route = useRoute()

const currentFloor = ref('0')
const floors = ['-1', '0', '1', '2', '3', '4']
const paramValue = route.query

const floorImages = {
  '-1': floor5,
  0: floor4,
  1: floor6,
  2: floor2,
  3: floor3,
  4: floor1,
}
// 楼梯数据，每层两个楼梯
const stairs = [
  // 连接楼层 0 和 1
  { id: 'C', floors: '0', position: { lat: 48.262612050692425, lon: 11.66733246371102 } },
  { id: 'D', floors: '0', position: { lat: 48.26247408487076, lon: 11.668671912456054 } },
  // 连接楼层 1 和 2
  { id: 'E', floors: '1', position: { lat: 48.26258958093238, lon: 11.667466576207298 } },
  { id: 'F', floors: '1', position: { lat: 48.26249744635467, lon: 11.668541804284992 } },

  { id: 'g', floors: '2', position: { lat: 48.262541073857314, lon: 11.667715261535651 } },
  { id: 'h', floors: '2', position: { lat: 48.2624351, lon:11.6683824 } },
]
// 定义地理边界（根据实际需求调整）

// 定义每层楼的配置
const floorConfigs = {
  '-1': {
    latMin: 48.2617,
    latMax: 48.2633,
    lonMin: 11.6664,
    lonMax: 11.6695,
    mapWidth: 3343,
    mapHeight : 2507,
    image: floor5,
  },
  0: {
    latMin: 48.2617788,
    latMax: 48.2632998,
    lonMin: 11.6664511,
    lonMax: 11.6694875,
    mapWidth: 3343,
    mapHeight : 2507,
    image: floor4,
  },
  1: {
      latMin: 48.2617788,
    latMax: 48.2632998,
    lonMin: 11.6664511,
    lonMax: 11.6694875,
    mapWidth: 3343,
    mapHeight : 2507,
    image: floor6,
  },
  2: {
   latMin: 48.2617788,
    latMax: 48.2632998,
    lonMin: 11.6664511,
    lonMax: 11.6694875,
    mapWidth: 3343,
    mapHeight : 2507,
    image: floor2,
  },
  3: {
      latMin: 48.2617788,
    latMax: 48.2632998,
    lonMin: 11.6664511,
    lonMax: 11.6694875,
    mapWidth: 3343,
    mapHeight : 2507,
    image: floor3,
  },
  4: {
    latMin: 48.2618,
    latMax: 48.2632,
    lonMin: 11.6665,
    lonMax: 11.6694,
    mapWidth: 3343,
    mapHeight: 2507,
    image: floor1,
  },
}

const userPosition = ref({ lat: null, lon: null })
// const watchId = ref(null)
const needsFloorChange = ref(false)

// 初始化卡尔曼滤波器
const kalmanFilterLat = new KalmanFilter({ R: 0.01, Q: 3 })
const kalmanFilterLon = new KalmanFilter({ R: 0.01, Q: 3 })
const staircaseToUse =ref(null)
const nearstairID = ref(null)
const kalmanFilterLatRoom = new KalmanFilter()
const kalmanFilterLonRoom = new KalmanFilter()
const rotationAngle = 0 // 旋转角度
console.log(currentFloor?.value,floorConfigs,'===>currentFloor?.value')
// 校准参数
const scaleX = floorConfigs[currentFloor.value].mapWidth / (floorConfigs[currentFloor.value].lonMax - floorConfigs[currentFloor.value].lonMin)
const scaleY = floorConfigs[currentFloor.value].mapHeight / (floorConfigs[currentFloor.value].latMax - floorConfigs[currentFloor.value].latMin)
const offsetX = 0
const offsetY = 0

function convertLatLonToMap(lat, lon) {
  const x = (lon - floorConfigs[currentFloor.value].lonMin) * scaleX + offsetX
  const y = (lat - floorConfigs[currentFloor.value].latMin) * scaleY + offsetY
  return [y, x]
}

function convertMapToLatLon(x, y) {
  const lon = (x - offsetX) / scaleX + floorConfigs[currentFloor.value].lonMin
  const lat = (y - offsetY) / scaleY + floorConfigs[currentFloor.value].latMin
  return { lat, lon }
}

// 创建自定义箭头图标
const arrowLeafletIcon = L.icon({
  iconUrl: arrowIcon,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15],
})

const deviceHeading = ref(0)

function handleOrientation(event) {
  if (event.alpha !== null) {
    deviceHeading.value = event.alpha
    updateMarkerRotation(deviceHeading.value)
  }
}

function updateMarkerRotation(angle) {
  if (marker.value) {
    const iconElement = marker.value.getElement()
    if (iconElement) {
      iconElement.style.transform = `rotate(${angle}deg)`
    }
  }
}

// 颜色匹配函数（带容差）
function isColorMatch(r, g, b, targetR, targetG, targetB, tolerance = 30) {
  const distance = Math.sqrt(
    Math.pow(r - targetR, 2) + Math.pow(g - targetG, 2) + Math.pow(b - targetB, 2),
  )
  return distance <= tolerance
}

/**
 * 生成可通行矩阵
 * @param {Uint8ClampedArray} imageData - 图像数据
 * @param {number} width - 图像宽度
 * @param {number} height - 图像高度
 * @param {number} gridRows - 网格的行数
 * @param {number} gridCols - 网格的列数
 * @param {number} tolerance - 颜色匹配容差
 * @param {number} rotationDegrees - 图像的旋转角度（顺时针为正）
 * @param {boolean} flip - 是否进行垂直翻转
 * @returns {Array<Array<number>>} - 可通行矩阵
 */
function generateWalkableMatrix(
  imageData,
  width,
  height,
  gridRows = 400,
  gridCols = 400,
  tolerance = 30,
  rotationDegrees = 10, // 顺时针旋转 10 度
  flip = true, // 是否进行垂直翻转
) {
  // 初始化矩阵为阻挡（1）
  let tempMatrix = Array.from({ length: gridRows }, () => Array(gridCols).fill(1))

  const pixelPerRow = height / gridRows
  const pixelPerCol = width / gridCols

  // 计算图像的中心点
  const centerX = width / 2
  const centerY = height / 2

  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      // 计算网格单元的中心点
      const x = col * pixelPerCol + pixelPerCol / 2
      const y = row * pixelPerRow + pixelPerRow / 2

      // 逆旋转采样点，以校正图像的旋转
      // 因为图像顺时针旋转了 10 度，所以需要逆时针旋转 10 度
      const [rotatedX, rotatedY] = rotatePoint(x, y, 0, centerX, centerY)

      // 确保旋转后的坐标在图像范围内
      const boundedX = Math.min(Math.max(Math.floor(rotatedX), 0), width - 1)
      const boundedY = Math.min(Math.max(Math.floor(rotatedY), 0), height - 1)

      // 计算 RGBA 索引
      const index = (boundedY * width + boundedX) * 4 // RGBA

      const r = imageData[index]
      const g = imageData[index + 1]
      const b = imageData[index + 2]

      // 根据颜色判断是否可通行
      // 新颜色: RGB (240, 255, 154)
      if (isColorMatch(r, g, b, 240, 255, 154, tolerance)) {
        tempMatrix[row][col] = 0 // 可通行
      } else if (isColorMatch(r, g, b, 189, 189, 189, tolerance)) {
        tempMatrix[row][col] = 2 // 教室
      } else {
        tempMatrix[row][col] = 1 // 阻挡
      }
    }
  }
  // 翻转矩阵（垂直翻转）
  if (flip) {
    tempMatrix = tempMatrix.reverse()
  }

  console.log('生成的可通行矩阵:', tempMatrix)
  return tempMatrix
}
// 初始化路径查找网格和寻路器
let pathfindingGrid = null
let finder = null

// 转换经纬度到网格坐标
function latLonToGridCoord(lat, lon, gridRows = 400, gridCols = 400) {
  const [y, x] = convertLatLonToMap(lat, lon)

  const centerX = floorConfigs[currentFloor.value].mapWidth / 2
  const centerY =  floorConfigs[currentFloor.value].mapHeight  / 2

  // 逆向旋转坐标，以对齐未旋转的网格
  const [xUnrot, yUnrot] = rotatePoint(
    x,
    y,
    -rotationAngle, // 旋转角度为负值
    centerX,
    centerY,
  )

  // 计算网格行和列
  const row = Math.floor(yUnrot / ( floorConfigs[currentFloor.value].mapHeight  / gridRows))
  const col = Math.floor(xUnrot / (floorConfigs[currentFloor.value].mapWidth / gridCols))

  // 限制行和列在网格范围内
  const clampedRow = Math.min(Math.max(row, 0), gridRows - 1)
  const clampedCol = Math.min(Math.max(col, 0), gridCols - 1)

  return { row: clampedRow, col: clampedCol }
}

// 转换网格坐标到经纬度
function gridCoordToLatLon(row, col, gridRows = 400, gridCols = 400) {
  const x = (col + 0.5) * (floorConfigs[currentFloor.value].mapWidth / gridCols)
  const y = (row + 0.5) * ( floorConfigs[currentFloor.value].mapHeight  / gridRows)
  return convertMapToLatLon(x, y)
}

/**
 * 查找教室的出口点
 * @param {Array<Array<Object>>} walkableMatrix - 可通行矩阵
 * @param {Object} startGrid - 起点网格坐标
 * @returns {Object} - 最近的教室出口点
 */
function findNearestClassroomExit(walkableMatrix, startGrid) {
  const queue = [startGrid]
  const visited = new Set()
  visited.add(`${startGrid.row},${startGrid.col}`)

  while (queue.length > 0) {
    const { row, col } = queue.shift()

    // 检查相邻的单元格是否是走廊（walkable 为 true）
    const neighbors = [
      { row: row - 1, col: col },
      { row: row + 1, col: col },
      { row: row, col: col - 1 },
      { row: row, col: col + 1 },
    ]

    for (const neighbor of neighbors) {
      if (
        neighbor.row >= 0 &&
        neighbor.row < walkableMatrix.length &&
        neighbor.col >= 0 &&
        neighbor.col < walkableMatrix[row].length &&
        !visited.has(`${neighbor.row},${neighbor.col}`)
      ) {
        visited.add(`${neighbor.row},${neighbor.col}`)
        if (walkableMatrix[neighbor.row][neighbor.col].walkable === true) {
          return neighbor
        } else {
          queue.push(neighbor)
        }
      }
    }
  }

  return null
}

const floorChange = (floor) => {
  switch (floor) {
    case -1:
      return 'Basement (B)'
    case 'Ground floor':
      return '0'
    case 'First Floor':
      return '1'
    case '2nd upper floor':
      return '2'
    case '3rd upper floor':
      return '3'
    case 'Fourth Floor':
      return '4'
    default:
      return 'Invalid Floor'
  }
}

// 查找路径
function findPathList(start, end) {
  try {
    const userFloor = currentFloor.value
    // const targetFloorValue = floorChange('Ground floor')//
    const targetFloorValue = floorChange(paramValue.floor) //
    if (userFloor == targetFloorValue) {
      // 同一楼层，直接导航
      return findPathSingleFloor(start, end)
    } else {
      const stairsOnCurrentFloor = stairs.filter((stair) => stair.floors == currentFloor.value)
      if (stairsOnCurrentFloor.length === 0) {
        console.error('当前楼层没有可用的楼梯')
        return []
      }
      let nearestStair = stairsOnCurrentFloor[0]

      let minDistance = calculateDistance(userPosition.value, nearestStair.position)


      for (let i = 1; i < stairsOnCurrentFloor.length; i++) {
        const stair = stairsOnCurrentFloor[i]
        const distance = calculateDistance(userPosition.value, stair.position)
        if (distance < minDistance) {
          minDistance = distance
          nearestStair = stair
        }
      }
nearstairID.value = nearestStair.id
// alert(nearstairID.value )
      // 导航到楼梯
      return findPathSingleFloor(start, nearestStair.position)
    }
  } catch (error) {
    console.error('路径查找失败:', error)
    return []
  }
}

function findPathSingleFloor(start, end) {
  try {
    const startGrid = latLonToGridCoord(start.lat, start.lon)
    const endGrid = latLonToGridCoord(end.lat, end.lon)
    console.log(startGrid, endGrid, pathfindingGrid, '===>startGrid, endGrid')

    // 如果起点在教室内部，找到最近的出口点
    if (pathfindingGrid.nodes[endGrid.row][endGrid.col].walkable === false) {
      console.log(startGrid, endGrid, pathfindingGrid, '===>startGrid, endGrid')
      const nearestExit = findNearestClassroomExit(pathfindingGrid.nodes, endGrid)
      console.log(nearestExit, '===>nearestExit')
      if (nearestExit) {
        endGrid.row = nearestExit.row
        endGrid.col = nearestExit.col
      } else {
        console.log('未找到教室出口')
      }
    }
    console.log(endGrid, '===>startGrid, endGrid')

    const path = finder.findPath(
      startGrid.col,
      startGrid.row,
      endGrid.col,
      endGrid.row,
      pathfindingGrid.clone(),
    )

    console.log('路径查找结果:', path)

    const pixelPath = path.map(([row, col]) => {
      const rowHeight = floorConfigs[currentFloor.value].mapWidth / gridCols
      const colWidth =  floorConfigs[currentFloor.value].mapHeight  / gridRows

      const y = col * colWidth + colWidth / 2
      const x = row * rowHeight + rowHeight / 2

      const [rotatedX, rotatedY] = rotatePoint(x, y, rotationAngle, floorConfigs[currentFloor.value].mapWidth / 2,  floorConfigs[currentFloor.value].mapHeight  / 2)

      return [rotatedY, rotatedX]
    })
    return pixelPath
  } catch (error) {
    console.error('路径查找失败:', error)
    return []
  }
}

// 绘制导航路径
const drawNavigationPathFunction = (start, end) => {
  if (navigationPath.value) {
    map.value.removeLayer(navigationPath.value)
  }
  console.log(start, end, '===>start, end')
  const path = findPathList(start, end)
  if (path.length > 0) {
    navigationPath.value = L.polyline(path, { color: 'blue' }).addTo(map.value)
  } else {
    console.warn('')
  }
}

// 加载并处理楼层图像，生成可通行矩阵
function loadFloor(floor) {
  const imageUrl = floorImages[floor]
  const imageBounds = [
    [0, 0],
    [ floorConfigs[currentFloor.value].mapHeight , floorConfigs[currentFloor.value].mapWidth],
  ]

  // 移除现有的 ImageOverlay 层
  map.value.eachLayer((layer) => {
    if (layer instanceof L.ImageOverlay) {
      map.value.removeLayer(layer)
    }
  })

  // 添加新的 ImageOverlay
  const imageOverlay = L.imageOverlay(imageUrl, imageBounds).addTo(map.value)

  // 在图片加载完成后处理图像
  imageOverlay.on('load', () => {
    const img = imageOverlay.getElement()
    if (img) {
      img.style.transformOrigin = 'center center'
      img.style.transition = 'transform 0.5s'
    }

    // 使用 Canvas 处理图像颜色，生成可通行矩阵
    processImageForPathfinding(imageUrl)
  })

  // 使用 fitBounds 自动调整视图和缩放级别
  map.value.fitBounds(imageBounds, {
    padding: [50, 50],
    maxZoom: 2,
    minZoom: -1,
  })
}

// 使用 Canvas 处理图像颜色，生成可通行矩阵
function processImageForPathfinding(imageUrl) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const img = new Image()
  img.crossOrigin = 'Anonymous' // 处理跨域问题，如果图片来源不同域
  img.src = imageUrl

  img.onload = () => {
    canvas.width = img.width
    canvas.height = img.height
    ctx.drawImage(img, 0, 0, img.width, img.height)
    const imageData = ctx.getImageData(0, 0, img.width, img.height).data

    // 生成可通行矩阵（0=通行，1=阻挡）
    const walkableMatrix = generateWalkableMatrix(imageData, img.width, img.height)
    // 初始化 PathFinding.js 的网格和寻路器
    pathfindingGrid = new PathFinding.Grid(walkableMatrix)
    finder = new PathFinding.AStarFinder({
      allowDiagonal: true,
      dontCrossCorners: true,
    })
    // drawWalkableAreas(walkableMatrix)
    console.log('Pathfinding 网格已初始化')

    // 绘制可通行区域

    // 重新绘制网格以适应新楼层
    // drawGrid()
  }

  img.onerror = (error) => {
    console.error('图像加载失败:', error)
  }
}

// 绘制可通行区域
function drawWalkableAreas(walkableMatrix, gridRows = 400, gridCols = 400) {
  const rowHeight =  floorConfigs[currentFloor.value].mapHeight  / gridRows
  const colWidth = floorConfigs[currentFloor.value].mapWidth / gridCols

  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      if (walkableMatrix[row][col] === 0) {
        // 可通行
        const x = col * colWidth
        const y = row * rowHeight

        const cellBounds = [
          [y, x],
          [y + rowHeight, x],
          [y + rowHeight, x + colWidth],
          [y, x + colWidth],
          [y, x],
        ]
        L.polygon(cellBounds, {
          color: 'green',
          weight: 1,
          fillOpacity: 0.3,
        }).addTo(map.value)
      }
    }
  }
}

function drawUserLocation(lat, lon) {
  const filteredLat = kalmanFilterLat.filter(lat)
  const filteredLon = kalmanFilterLon.filter(lon)

  const [userMapY, userMapX] = convertLatLonToMap(filteredLat, filteredLon)

  console.log('用户位置:', userMapY, userMapX, marker.value)
  if (marker.value) {
    marker.value.setLatLng([userMapY, userMapX])
  } else {
    marker.value = L.marker([userMapY, userMapX], { icon: arrowLeafletIcon }).addTo(map.value)
  }

  // 检查是否到达楼梯
  if (needsFloorChange.value) {
    const userPos = { lat: filteredLat, lon: filteredLon }
    const atStair = checkIfAtStaircase(userPos)
    if (atStair) {
      needsFloorChange.value = false
      notifyUserToChangeFloor(staircaseToUse.value)
    }
  }
}

function drawRooms(lat, lon) {
  if (lat === undefined || lon === undefined) return
  const filteredLat = kalmanFilterLatRoom.filter(lat)
  const filteredLon = kalmanFilterLonRoom.filter(lon)
  const endGrid = latLonToGridCoord(lat, lon)
  const [roomMapY, roomMapX] = convertLatLonToMap(filteredLat, filteredLon)
  if (roomMarker.value) {
    roomMarker.value.setLatLng([roomMapY, roomMapX])
  } else {
    roomMarker.value = L.marker([roomMapY, roomMapX]).addTo(map.value)
  }
}

// 通知用户切换楼层
function notifyUserToChangeFloor(staircase) {
  // 使用 Element Plus 的弹窗
  const newFloor = staircase.floors.find((f) => f !== currentFloor.value)
  if (!newFloor) {
    console.error('无法确定目标楼层')
    return
  }

  ElMessageBox.confirm(`请通过楼梯 ${staircase.id} 切换到楼层 ${newFloor}`, '切换楼层确认', {
    confirmButtonText: '已切换',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      // 用户点击“已切换”，自动切换楼层
      changeFloor(newFloor)
    })
    .catch(() => {
      // 用户点击“取消”，取消切换楼层
      needsFloorChange.value = false
      staircaseToUse.value = null
    })
}

// 检查用户是否到达楼梯
function checkIfAtStaircase(userPos) {
  if (!needsFloorChange.value || !staircaseToUse.value) return false

  const stairPos = staircaseToUse.value.position
  const distance = calculateDistance(userPos, stairPos)

  const threshold = 0.00005 // 根据地图坐标系调整阈值
  return distance < threshold
}

// 计算两点之间的距离（简单的欧几里得距离）
function calculateDistance(pos1, pos2) {
  const dLat = pos1.lat - pos2.lat
  const dLon = pos1.lon - pos2.lon
  return Math.sqrt(dLat * dLat + dLon * dLon)
}

function changeFloor(floor) {
  console.log(floorConfigs[currentFloor.value].mapWidth,'====>floorConfigs[currentFloor.value].mapWidth')
  loadFloor(floor)
  if (userPosition.value.lat && userPosition.value.lon) {
    drawUserLocation(userPosition.value.lat, userPosition.value.lon)
  }
  if(!props.visibleStart){
    return
  }
     drawRooms(paramValue.lat, paramValue.lon)
    // 从楼梯切换楼层后，继续导航到目标
    const targetPosition = { lat: props.roomLat, lon: props.roomLon }
    let position =null
    if(nearstairID.value == 'C'){
position = stairs[4].position
    }else if(nearstairID.value == 'D'){
      position = stairs[5].position
    }else if(nearstairID.value == 'E'){
      position = stairs[4].position
    }else if(nearstairID.value == 'F'){
      position = stairs[5].position
    }
    // alert(JSON.stringify(position))
    //  drawRooms(position.lat, position.lon)
    drawNavigationPathFunction(
    position,
      targetPosition,
    )
    staircaseToUse.value = null // 清除楼梯使用记录
}

// 定义网格行列数
const gridRows = 400 // 根据需求调整
const gridCols = 400 // 根据需求调整

// 绘制网格
function drawGrid() {
  // 可以根据是否需要在地图上展示网格线决定是否绘制
  // 这里假设继续绘制网格线，保持与旋转一致

  const rowHeight =  floorConfigs[currentFloor.value].mapHeight  / gridRows
  const colWidth = floorConfigs[currentFloor.value].mapWidth / gridCols

  // 网格中心点
  const centerX = floorConfigs[currentFloor.value].mapWidth / 2
  const centerY =  floorConfigs[currentFloor.value].mapHeight  / 2

  // 移除已有的网格层
  if (map.value.gridLines) {
    map.value.gridLines.forEach((line) => map.value.removeLayer(line))
  }
  map.value.gridLines = []

  // 绘制水平线并旋转
  for (let i = 0; i <= gridRows; i++) {
    let y = i * rowHeight
    let start = rotatePoint(0, y, rotationAngle, centerX, centerY)
    let end = rotatePoint(floorConfigs[currentFloor.value].mapWidth, y, rotationAngle, centerX, centerY)

    const line = L.polyline(
      [
        [start[1], start[0]], // Leaflet 使用 [lat, lng]
        [end[1], end[0]],
      ],
      { color: 'blue', weight: 1, pane: 'gridPane' },
    )

    line.addTo(map.value)
    map.value.gridLines.push(line)
  }

  // 绘制垂直线并旋转
  for (let j = 0; j <= gridCols; j++) {
    let x = j * colWidth
    let start = rotatePoint(x, 0, rotationAngle, centerX, centerY)
    let end = rotatePoint(x,  floorConfigs[currentFloor.value].mapHeight , rotationAngle, centerX, centerY)
    const line = L.polyline(
      [
        [start[1], start[0]],
        [end[1], end[0]],
      ],
      { color: 'red', weight: 1, pane: 'gridPane' },
    )

    line.addTo(map.value)
    map.value.gridLines.push(line)
  }
}

// 旋转点
function rotatePoint(x, y, angle, centerX, centerY) {
  const radians = (Math.PI / 180) * angle
  const cos = Math.cos(radians)
  const sin = Math.sin(radians)

  // 将点平移到以中心点为原点
  const dx = x - centerX
  const dy = y - centerY

  // 旋转
  const rx = dx * cos - dy * sin
  const ry = dx * sin + dy * cos

  // 将点平移回原来的位置
  return [rx + centerX, ry + centerY]
}

// 高亮显示选中的网格单元
let highlightedCell = null

function highlightGridCell(row, col) {
  // 移除之前高亮的单元格
  if (highlightedCell) {
    map.value.removeLayer(highlightedCell)
    highlightedCell = null
  }

  const rowHeight =  floorConfigs[currentFloor.value].mapHeight  / gridRows
  const colWidth = floorConfigs[currentFloor.value].mapWidth / gridCols

  const x = col * colWidth
  const y = row * rowHeight

  // 创建一个多边形表示网格单元
  const cellBounds = [
    [y, x],
    [y + rowHeight, x],
    [y + rowHeight, x + colWidth],
    [y, x + colWidth],
    [y, x],
  ]

  // highlightedCell = L.polygon(cellBounds, {
  //   color: 'yellow',
  //   weight: 2,
  //   fillOpacity: 0.3,
  // }).addTo(map.value)
}

// 添加点击事件处理
const onMapClick = (e) => {
  const { lat, lng } = e.latlng // 在 CRS.Simple 下，lng 对应 x, lat 对应 y
  emit('pointSelected', { lat, lon: lng }) // 如果需要

  console.log(`经纬度地址: 行 ${lat}, 列 ${lng}`)
    const realCoords = convertMapToLatLon(lng, lat); // 注意顺序：传入 x (lng), y (lat)

  console.log(`点击位置的真实坐标: 纬度 ${realCoords.lat}, 经度 ${realCoords.lon}`);
  // let x_click = lng
  // let y_click = lat

  // const centerX = floorConfigs[currentFloor.value].mapWidth / 2
  // const centerY =  floorConfigs[currentFloor.value].mapHeight  / 2

  // // 应用逆向旋转，将点击点对齐到未旋转的网格坐标系
  // let [x_grid, y_grid] = rotatePoint(x_click, y_click, -rotationAngle, centerX, centerY)

  // // 计算对应的网格行和列
  // const row = Math.floor(y_grid / ( floorConfigs[currentFloor.value].mapHeight  / gridRows))
  // const col = Math.floor(x_grid / (floorConfigs[currentFloor.value].mapWidth / gridCols))

  // console.log(`网格地址: 行 ${row}, 列 ${col}`)

  // // 高亮选中的网格单元
  // highlightGridCell(row, col)

  // // 将网格坐标重新旋转回地图坐标系
  // let [x_map, y_map] = rotatePoint(x_grid, y_grid, rotationAngle, centerX, centerY)

  // // 更新用户位置标记，使用旋转后的地图坐标
  // if (marker.value) {
  //   marker.value.setLatLng([y_map, x_map])
  // } else {
  //   marker.value = L.marker([y_map, x_map], { icon: arrowLeafletIcon }).addTo(map.value)
  // }

  // 如果处于导航状态，设置目标点并绘制路径
  // const start = { lat:48.2627573238361, lon: 11.666797000126897 }
  // const end = { lat:paramValue.lat, lon: paramValue.lon }
  // let userPositionValue = { lat: userPosition.value.lat, lon: userPosition.value.lon }
  // let targetPosition = { lat: paramValue.lat, lon: paramValue.lon }
  // drawNavigationPathFunction(userPosition.value.lat, userPosition.value.lon)
}

onMounted(() => {
  // 初始化地图
  map.value = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -2,
    maxZoom: 3,
    zoomSnap: 0.5,
    scrollWheelZoom: true,
    doubleClickZoom: true,
    dragging: true,
  }).setView([ floorConfigs[currentFloor.value].mapHeight  / 2, floorConfigs[currentFloor.value].mapWidth / 2], 1)

  // 添加比例尺
  L.control.scale().addTo(map.value)

  // 创建一个新的 pane 用于网格层
  map.value.createPane('gridPane')
  map.value.getPane('gridPane').style.zIndex = 650 // 高于默认 pane

  // 加载初始楼层
  loadFloor(currentFloor.value)

  // 绘制网格
  // drawGrid()

  // 添加网格监听器，以便在楼层切换时重新绘制网格
  watch(
    currentFloor,
    (newFloor) => {
      loadFloor(newFloor)
    },
    { immediate: true },
  )
  let user ={
    lat:null,
    lon:null
  }
  // 地理定位
  if (navigator.geolocation) {
    // const intervalId = setInterval(() => {
     const watchIds =   navigator.geolocation.watchPosition(
        (position) => {
          userPosition.value.lat = position.coords.latitude
          userPosition.value.lon = position.coords.longitude
          user.lat = position.coords.latitude
            user.lon =  position.coords.longitude
          drawUserLocation(userPosition.value.lat, userPosition.value.lon)

        },
        (error) => {},
        {
       enableHighAccuracy: true, // 高精度定位
    maximumAge: 0,            // 不使用缓存
    timeout: 10000,           // 延长超时时间以获取更准确的位置
        },
      )
    // }, 1000)
    // watchId.value = intervalId
    // 初始绘制用户位置和房间
    console.log(route, '===>reot')
    console.log(paramValue, '===>paramValue')
    if (currentFloor.value == floorChange(route.query.floor)) {
      drawRooms(paramValue.lat, paramValue.lon)
    }
  } 
  // const start = { lat:48.2627573238361, lon: 11.666797000126897 }
  // const end = { lat:paramValue.lat, lon: paramValue.lon }
  // let userPositionValue = { lat: userPosition.value.lat, lon: userPosition.value.lon }
  //     let targetPosition = { lat: paramValue.lat, lon: paramValue.lon }
  // drawNavigationPathFunction(start, end)
setTimeout(() => {
      let userPositionValue = { lat:  userPosition.value.lat, lon:  userPosition.value.lon  }
        let targetPosition = { lat: paramValue.lat, lon: paramValue.lon }
        drawNavigationPathFunction(userPositionValue, targetPosition)
}, 1000);


 
    
  // 添加设备方向监听
  if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', handleOrientation, true)
  }

  // 添加点击事件监听器
  map.value.on('click', onMapClick)
})

onUnmounted(() => {
  // if (watchId.value !== null) {
  //   clearInterval(watchId.value)
  // }
  window.removeEventListener('deviceorientation', handleOrientation, true)
  if (map.value) {
    map.value.off('click', onMapClick)
  }
  // 移除网格线
  if (map.value.gridLines) {
    map.value.gridLines.forEach((line) => map.value.removeLayer(line))
  }
  // 移除高亮的网格单元
  if (highlightedCell) {
    map.value.removeLayer(highlightedCell)
  }
})

// 监听 isSelecting 状态
watch(
  () => props.isSelecting,
  (newVal) => {
    if (!map.value) {
      return
    }
    if (newVal) {
      // map.value.on('click', onMapClick)
      map.value.getContainer().style.cursor = 'crosshair'
    } else {
      // map.value.off('click', onMapClick)
      map.value.getContainer().style.cursor = ''
    }
  },
)



// 监听导航状态
watch(
  () => props.isNavigating,
  (newVal) => {
          let userPositionValue = { lat: userPosition.value.lat, lon: userPosition.value.lon }
        let targetPosition = { lat: paramValue.lat, lon: paramValue.lon }
        console.log('coming',targetPosition,userPositionValue)

    if (newVal) {
      if (userPosition.value.lat && userPosition.value.lon && paramValue.lat && paramValue.lon) {
        // let userPositionValue = { lat: userPosition.value.lat, lon: userPosition.value.lon }
        // let targetPosition = { lat: paramValue.lat, lon: paramValue.lon }
        // const start = { lat:48.2627573238361, lon: 11.666797000126897 }
        // const end = { lat:paramValue.lat, lon: paramValue.lon }
        drawNavigationPathFunction(userPositionValue, targetPosition)
      }
    } else if (navigationPath.value) {
      map.value.removeLayer(navigationPath.value)
      navigationPath.value = null
    }
  },
     { immediate: true } // 添加 immediate: true 选项


)


</script>

<style scoped>
.map {
  width: 100%;
  border-radius: 10px;
  margin-bottom: 15px;
  position: relative;
  background: #fff;
}

.floor-selector {
  position: absolute;
  top: 10px;
  right: 7px;
  z-index: 1000;
  padding: 5px;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.leaflet-marker-icon {
  transform: rotate(0deg) !important;
}

.leaflet-popup-content-wrapper,
.leaflet-popup-tip {
  transform: rotate(0deg) !important;
}

.leaflet-grid-tile {
  background-color: rgba(0, 0, 0, 0.05);
}
.info {
  top: 10px;
  left: 10px;
  z-index: 1000;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
      display: flex
;
    width: 360px;
    margin-top: -56px;
    background: #76A1F8;
    color: #FFFFFF;
    margin-left: 11px;
}
</style>
