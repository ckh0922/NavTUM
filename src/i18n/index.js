// src/i18n/index.js
import { createI18n } from 'vue-i18n'

// 导入语言文件
import en from './locales/en.json'
import de from './locales/de.json'

// 选择默认语言，可以基于浏览器设置或存储的设置
const defaultLanguage = localStorage.getItem('language') || 'en'

// 创建 i18n 实例
const i18n = createI18n({
    locale: defaultLanguage, // 设置默认语言
    fallbackLocale: 'en', // 设置回退语言
    messages: {
        en,
        de,
    },
})

export default i18n