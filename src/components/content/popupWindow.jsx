import "/src/stylesheet/popupWindow.less"
import {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {Icon} from '@iconify/react';

const PopupWindow = ({children}) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [isHide, setHide] = useState(false)
    useEffect(() => {
        document.body.style.overflow = "hidden"
        return () => {
            document.body.style.overflow = "unset"
        };
    }, [])

    function redirectRoute() {
        setHide(true)
        setTimeout(() => {
            navigate(location.pathname.replace(/\/[^/]*$/, ''))
        }, 400)
    }

    return <div className="popupWindow">
        <div className={"mask" + (isHide ? " hide" : "")} onClick={redirectRoute}></div>
        <div className={"container" + (isHide ? " hide" : "")}>
            <div className="top">
                <a className="close" onClick={redirectRoute}><Icon icon="ri:close-fill"/></a>
            </div>
            {children}
        </div>
    </div>
}
export default PopupWindow