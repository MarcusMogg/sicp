import { App, defineUserConfig } from 'vuepress'
import type { DefaultThemeOptions } from 'vuepress'
import { path } from '@vuepress/utils'
export default defineUserConfig<DefaultThemeOptions>({
    lang: 'zh-CN',
    title: 'Hello SICP',
    description: "在线运行sicp代码",
    base: '/sicp/',
    themeConfig: {
        logo: '/sicp/main-banner.gif',
        navbar: [
            {
                text: '第一章',
                link: '/chap1/',
            },
            {
                text: '第二章',
                link: '/chap2/',
            },
            {
                text: '语法',
                link: '/syntax/',
            },
        ],
        sidebar: {
            '/chap1/': [
                {
                    isGroup: true,
                    text: '第一章',
                    children: [
                        '/chap1/1-1.md',

                    ],
                },
            ],
            '/chap2/': [
                {
                    isGroup: true,
                    text: '第二章',
                    children: [
                        '/chap1/1-1.md',

                    ],
                },
            ],
            '/syntax/': [
                {
                    isGroup: true,
                    text: '语法',
                    children: [
                        '/syntax/lexical.md',
                        '/syntax/expression.md',
                        '/syntax/standard_procedures.md',
                    ],
                },
            ],
        }
    },
    alias: {
        '@': path.resolve(__dirname, '../../'),
    },
})