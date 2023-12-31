import {getArticleContent} from "./http.js";
import {hiddenError} from "../router/router.jsx";

export function scrollToTop(scrollDuration = 200) {
    const scrollStep = -window.scrollY / (scrollDuration / 15);

    const scrollInterval = setInterval(() => {
        if (window.scrollY !== 0) {
            window.scrollBy(0, scrollStep);
        } else {
            clearInterval(scrollInterval);
        }
    }, 15);
}

/**
 * 延迟执行
 * @param {number} delay 延迟多少毫秒
 * @returns {Promise<unknown>}
 */
export const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

String.prototype.toInt = function () {
    return parseInt(this.replace(/\D+/g, "") || 0)
}
Number.prototype.toInt = function () {
    return this
}
const consoleInfo = console.info

console.info = function (...args) {
    consoleInfo("%c" + (args.join(" ")), "padding:2px 4px;color:white;background:dodgerblue;")
}

let p = _ => location.pathname
export const routeTools = {

    root: "/",
    articles: "/articles",
    default: "/articles",
    search: "/search",
    category: "/category",
    articleDetails(id) {
        return this.articles + "/" + id
    },
    searchArticle(search) {
        return this.search + "/" + search
    },
    isSearch() {
        return p().indexOf(this.search) === 0
    },
    isCategory(path) {
        if (path)
            return path.indexOf(this.category) === 0

        return p().indexOf(this.category) === 0
    },
    isSearchByTag(params) {
        return params.query.indexOf("Tag:") === 0
    },
    /**
     *
     * @param {number|string} current
     * @param {number|string} target
     */
    isCurrentIndex(current, target) {
        return current.toInt() === target.toInt()
    },
    isRoot() {
        return p() === this.root
    },
    isDefault() {
        return p() === this.root || p() === this.default
    },
    front() {
        if (this.isDefault())
            return this.default
        return p().match(/\w+/g)[0]
    },
    isArticles() {
        return p().indexOf(this.articles) === 0 || p() === this.root
    }

}

export const SEOTools = {
    defaultTitle: "部落格 - nano71.com",
    baseTitle: " - nano71.com",
    defaultDescription: "非常简单的BLOG",
    ogDescription() {
        return document.querySelector('meta[property="og:description"]')
    },
    description() {
        return document.querySelector('meta[name="description"]')
    },
    articles: {
        title() {
            return document.querySelector("article.article .title")
        },
        datetime() {
            return document.querySelector("article.article .datetime")
        },
        description() {
            return document.querySelector("article.article .description")
        },
        content() {
            return document.querySelector("article.article .content")
        }
    },
    reset() {
        window.document.title = this.defaultTitle
        this.ogDescription().setAttribute("content", this.defaultDescription)
        this.description().setAttribute("content", this.defaultDescription)
        this.articles.title().innerHTML = ""
        this.articles.description().innerHTML = ""
        this.articles.datetime().innerHTML = ""
        this.articles.content().innerHTML = ""
        return this
    },
    setTitle(title) {
        window.document.title = title + this.baseTitle
        this.articles.title().innerHTML = title
        return this
    },
    setDateTime(datetime) {
        this.articles.datetime().innerHTML = datetime
        return this
    },
    setContent(content) {
        this.articles.content().innerHTML = content
        return this
    },
    setDescription(description) {
        description = description.replace(/<p>|<\/p>/g, "")
        this.articles.description().innerHTML = description
        this.ogDescription().setAttribute("content", description)
        this.description().setAttribute("content", description)
        return this
    },
    /**
     *
     * @param articleId
     * @return {Article}
     */
    async articleDetailsLoader(articleId) {
        console.log(articleId);
        const article = await getArticleContent(parseInt(articleId))
        if (article) {
            this.setTitle(article.title)
            this.setContent(article.content)
            this.setDateTime(article.updateTime)
            this.setDescription(article.description)
        } else {
            throw hiddenError("The article is non-existent.")
        }
        sessionStorage.setItem("articleDetails", JSON.stringify(article))
        return article
    }
}
