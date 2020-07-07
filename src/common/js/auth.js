// uInfo
export function setUInfo(uInfo) {
     sessionStorage.setItem('userInfo', uInfo)
}

export function getUInfo() {
     return sessionStorage.getItem('userInfo')
}

export function removeUInfo() {
     sessionStorage.removeItem('userInfo')
}

// token
export function setToken(token) {
     sessionStorage.setItem('token', token)
}

export function getToken() {
     return sessionStorage.getItem('token')
}

export function removeToken() {
     sessionStorage.removeItem('token')
}

// role
export function setRole(role) {
     sessionStorage.setItem('role', role)
}

export function getRole() {
     return sessionStorage.getItem('role')
}

export function removeRole() {
     sessionStorage.removeItem('role')
}

