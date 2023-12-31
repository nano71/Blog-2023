import TagList from "./tagList.jsx";
import {useContext} from "react";
import {TagListContext} from "../../pages/index.jsx";
import Loading from "/src/components/content/loading.jsx";


export default () => {
    const tagList = useContext(TagListContext)

    return (
        tagList.length ? <div className="tab active">
            <TagList tagList={tagList}/>
            <div className="placeholder"></div>
        </div> : <Loading/>
    )

}
