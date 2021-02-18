export default function bytesToSize(bytes) {
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    if (!bytes) {
        return '0 Byte'
    }

    const i = +Math.floor(Math.log(bytes) / Math.log(k))

    return Math.round(bytes / Math.pow(k, i)) + ' ' + sizes[i]
}

