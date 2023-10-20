import React, {useEffect, useState} from "react";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import "/src/stylesheet/editor.less";
import MarkdownIt from "markdown-it";
import {Icon} from "@iconify/react";
import {useNavigate} from "react-router-dom";

export default function Editor() {
    const [content, setContent] = useState("");
    const [HTML, setHTML] = useState("");
    const [title, setTitle] = useState("")
    const [coverImage, setCoverImage] = useState("")
    const [createTime, setTime] = useState("")
    const [isFormat, setFormatStatus] = useState(false)
    const [tags, setTags] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        setTime(new Date().toLocaleString())
    }, []);

    function preview() {
        let draft = {
            title,
            content: HTML,
            description: HTML.match(/<p>(.*?)<\/p>/g)[0] || "",
            createTime,
            coverImage,
            tags
        }
        localStorage.setItem("draft", JSON.stringify(draft))
        console.log(localStorage.getItem("draft"));
        navigate("/write/preview")
    }

    function uploadImage(file) {
        const url = URL.createObjectURL(file)
        console.log(url);
        setCoverImage(url)
    }

    function addTag(event) {
        console.log(event.code);
        if (["Enter", "Space", "NumpadEnter"].includes(event.code) && tags.length < 3) {
            const string = event.target.value
            if (!tags.includes(string)) {
                setTags(tags.concat(event.target.value.split(" ")[0]))
            }
            setTimeout(() => {
                event.target.value = ""
            }, 0)
        }
    }

    function formatDateTime(event) {
        if (event.code.includes("Enter")) {
            setTime(new Date(event.target.value).toLocaleString());
            setFormatStatus(true)
        }
    }

    return <div className="editor">
        <h1 className="title">-Write an article-</h1>
        <div className="inputArea">
            <input onChange={e => setTitle(e.target.value)}
                   type="text" className="titleInput" placeholder="请输入标题"/>
            <div className="previewButton" title="预览" onClick={preview}><Icon icon="ri:bill-line"/></div>
            <MarkdownEditor value={content} setValue={setContent} setOut={setHTML}/>
            <div className="options">
                <div className="item">
                    <div className="label">文章的封面</div>
                    <div className="inputBox">
                        {!coverImage ? <div className="previewBox">
                                <Icon icon="ri:add-fill"/>
                                <span>添加文章封面</span>
                            </div> :
                            <div className="previewImage">
                                <img src={coverImage} alt=""/>
                            </div>
                        }
                        <input type="file" className="imgUpload" alt={""} accept={"image/*"}
                               onChange={e => uploadImage(e.target.files[0])}/>
                        <div className="tip">图片上传格式支持 JPEG、JPG、PNG</div>
                    </div>
                </div>
                <div className="item">
                    <div className="label">技术栈标签</div>
                    <div className="inputBox">
                        <input type="text" placeholder="回车或空格添加标签" className="dateTime"
                               onKeyDown={addTag}/>
                        {!!tags.length && <div className="tags">
                            {tags.map((value, index) =>
                                <div className="tag"
                                     onClick={() =>
                                         setTags(tags.filter((v, i) => i !== index))}>
                                    {value}
                                    <Icon icon="ri:close-fill"/>
                                </div>
                            )}
                        </div>}
                    </div>
                </div>
                <div className="item">
                    <div className="label">自定义时间</div>
                    <div className="inputBox">
                        <input type="text" value={createTime} className="dateTime"
                               onChange={e => setTime(e.target.value)} onKeyDown={formatDateTime}/>
                        <div className="tip">按回车键, 自动格式化时间</div>
                    </div>
                </div>

            </div>

        </div>
        <div className="buttons">
            <span>click here<Icon icon="ri:arrow-right-s-line"/></span>
            <a className="button">-Submit-</a>
        </div>
    </div>
}

function MarkdownEditor({value, setValue, setOut}) {
    const mdParser = new MarkdownIt();

    const plugins = ["font-bold", "font-italic", "font-underline", "font-strikethrough", "list-unordered", "list-ordered", "block-quote", "block-code-inline", "block-code-block", "image", "link", "logger"]

    useEffect(() => {
        setValue(localStorage.getItem("markdownInputHistory") || "")
        setOut(localStorage.getItem("markdownOutHistory") || "")
    }, []);

    function handleEditorChange({html, text}) {
        setValue(text)
        setOut(html)
        localStorage.setItem("markdownInputHistory", text)
        localStorage.setItem("markdownOutHistory", html)
    }

    function onImageUpload(file) {
        return new Promise(resolve => {
            resolve("https://images.pexels.com/photos/4554150/pexels-photo-4554150.jpeg?auto=compress&cs=tinysrgb&w=1200")
        });
    }

    return <MdEditor
        id="markdownEditor"
        style={{height: "700px", border: 0}}
        plugins={plugins}
        value={value}
        shortcuts={true}
        markdownClass="editorContainer"
        placeholder="Compose an epic..."
        renderHTML={text => mdParser.render(text)}
        view={{menu: true, md: true, html: false}}
        onImageUpload={onImageUpload}
        onChange={handleEditorChange}/>
}