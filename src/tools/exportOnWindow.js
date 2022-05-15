const exportOnWindow = (obj) => {
    Object.keys(obj).forEach((key) => {
        window[key] = obj[key]
    })
}

export default exportOnWindow;