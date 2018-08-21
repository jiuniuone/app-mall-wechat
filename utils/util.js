const urlPrefix = "http://192.168.1.176/api/mall";

//const urlPrefix = "http://192.168.31.80/api/mall";
function request(obj) {
    obj.url = urlPrefix + obj.url;
    return wx.request(obj);
}

function formatTime(date) {
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hour = date.getHours();
    let minute = date.getMinutes();
    let second = date.getSeconds();
    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':');
}

function formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
}

function alert(title, content) {
    return wx.showModal({title: title, content: content, showCancel: false});
}

function hideLoading() {
    return wx.hideLoading();
}

function getStorageSync(name) {
    return wx.getStorageSync(name);
}


function navigateTo(obj) {
    return wx.navigateTo(obj);
}


module.exports = {
    formatTime: formatTime,
    alert: alert,
    hideLoading: hideLoading,
    request: request,
    navigateTo: navigateTo,
    request: request,
    getStorageSync: getStorageSync,
}
