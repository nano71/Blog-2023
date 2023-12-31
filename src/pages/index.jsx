import "/src/stylesheets/index.less"
import React, {createContext, useEffect, useState} from "react";
import {getRecentArticles, getTagList, searchArticles, searchArticlesByTag, staticResourceURL} from "../utils/http.js";
import Cover from "../components/cover/cover.jsx";
import Content from "../components/content/content.jsx";
import PopupProvider from "../components/popup/popup.jsx";
import {useParams} from "react-router-dom";
import {useImmer} from "use-immer";
import {routeTools} from "../utils/tools.js";


const recentArticlesContextValue = {
    isLoading: true, list: [], total: 0, limit: 0, page: 0
}

const articleListRequestStateContextValue = {code: 0, message: "", data: null}
export const ArticleListObjectContext = createContext(null)
export const ArticleListRequestStateContext = createContext(articleListRequestStateContextValue)
export const CoverImageIndexContext = createContext(null)
export const TagListContext = createContext(null)

let fetchingArticles = false
let fetchingTagList = false
const resultLimit = 8
let previousAction = ""
export let previousRoute = "initial"

function Index() {
    const [articleListObject, setArticleListObject] = useImmer(recentArticlesContextValue)
    const [tagList, setTagList] = useState([])
    const [coverImage, setCoverImage] = useState("")
    const [articleListRequestState, setArticleListRequestState] = useState(articleListRequestStateContextValue)
    const params = useParams()

    useEffect(() => {
        getTagListData()
    }, [])

    /**
     * 获取文章列表数据
     * @param {string} message debug消息
     * @param {string} query
     * @param {string} tag 通过标签搜索
     * @param {number|string} page
     * @returns {void}
     */
    async function getArticleListData({message = "", query = "", tag = "", page = 1} = {}) {
        if (fetchingArticles)
            return

        setArticleListObject(draft => {
            fetchingArticles = true
            draft.isLoading = true
        })
        console.info("getArticleListData", message, "query:", query, "tag:", tag, "page:", page);

        let result
        if (tag) {
            result = await searchArticlesByTag(tag, resultLimit, page)
            previousAction = `tag-${tag}-${page}`
        } else if (query) {
            result = await searchArticles(query, resultLimit, page)
            previousAction = `query-${query}-${page}`
        } else {
            result = await getRecentArticles(resultLimit, page)
            previousAction = `recent-${page}`
        }

        setArticleListObject(draft => {
            if (result[0])
                return result[0]
            else
                draft.isLoading = false
        })
        setArticleListRequestState(result[1])

        fetchingArticles = false
    }

    /**
     * 获取标签列表数据
     * @returns {void}
     */
    async function getTagListData() {
        console.log("getTagListData");
        let tagList = await getTagList()
        if (tagList) {
            setTagList(tagList)
        } else {
            // todo 技术栈标签列表获取失败的处理
        }
    }

    // todo 路由待完善, 1:上一次搜索和本次搜索如果相同会不命中
    useEffect(() => {
        // todo 本次路由为文章页, 且有上一个路由的时候, 不触发刷新,
        //  上一次路由为Category页且本次路由为Articles页且上一次操作为Recent,
        //  上一次路由为文章页,
        //  上一次数据请求和本次即将发起的数据请求一致时, 不触发刷新,

        console.info("location.pathname:", location.pathname, "previousRoute:", previousRoute);
        if (params.articleId && previousRoute !== "initial") {
            previousRoute = "article"
            return;
        }
        if ((routeTools.isCategory(previousRoute) &&
                routeTools.isArticles() &&
                previousAction.indexOf("recent") === 0)
            || routeTools.isCategory()
            || previousRoute === "article"
            || (previousAction === ("recent-" + (params.pageIndex || 1)) && routeTools.isArticles())
            // || routeTools.isSearch() && previousAction === (`query-${params.query}-${params.pageIndex || 1}`)
        ) {
            previousRoute = location.pathname
            return
        }
        console.info("location hit", "previousRoute:", previousRoute, "previousAction:", previousAction);
        if (!(previousRoute === "initial" && params.articleId))
            previousRoute = location.pathname

        let tag = undefined
        if (params.query?.indexOf("Tag:") === 0) {
            tag = params.query.replace("Tag:", "")
        }
        getArticleListData({message: "onUpdate", query: params.query, tag, page: params.pageIndex})

    }, [params])

    return (<>
        <PopupProvider>
            <div className="index">
                <ArticleListObjectContext.Provider value={articleListObject}>
                    <CoverImageIndexContext.Provider value={{coverImage, setCoverImage}}>
                        <Cover/>
                        <ArticleListRequestStateContext.Provider value={articleListRequestState}>
                            <TagListContext.Provider value={tagList}>
                                <Content/>
                            </TagListContext.Provider>
                        </ArticleListRequestStateContext.Provider>
                    </CoverImageIndexContext.Provider>
                </ArticleListObjectContext.Provider>
                <img src={staticResourceURL + "mona-loading-default.gif"} style={{display: "none"}} alt=""/>
            </div>
        </PopupProvider>
    </>)
}

export default Index
