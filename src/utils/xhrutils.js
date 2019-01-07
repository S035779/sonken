import std from 'Utilities/stdutils';

/**
 * get
 *
 * @param {string} url
 * @param {object} data 
 * @param {function} resolve 
 * @param {function} reject 
 */
const get = function(url, data, resolve, reject) {
  const request = new XMLHttpRequest();
  request.open("GET", url + "?" + std.urlencode_rfc3986(data));
  request.onreadystatechange = function() {
    if (request.readyState === 4) {
      if (request.status === 200) {
        const type = request.getResponseHeader("Content-Type");
        if (type && type.indexOf("xml") !== -1 && request.responseXML) {
          resolve(request.responseXML);
        } else if (type === "application/json; charset=utf-8") {
          resolve(JSON.parse(request.responseText));
        } else {
          resolve(request.responseText);
        }
      } else {
        reject(JSON.parse(request.responseText));
      }
    }
  };
  request.onerror = function() { reject(request.statusText); };
  request.send(null);
};

/**
 * getJSON
 *
 * @param {string} url
 * @param {object} data 
 * @param {function} resolve 
 * @param {function} reject 
 */
const getJSON = function(url, data, resolve, reject) {
  const request = new XMLHttpRequest();
  request.open("GET", url + "?" + std.urlencode_rfc3986(data));
  request.onreadystatechange = function() {
    if (request.readyState === 4) {
      if (request.status === 200) {
        const type = request.getResponseHeader("Content-Type");
        if (type && type.indexOf("xml") !== -1 && request.responseXML) {
          resolve(request.responseXML);
        } else if (type === "application/json; charset=utf-8") {
          resolve(JSON.parse(request.responseText));
        } else {
          resolve(request.responseText);
        }
      } else {
        reject(JSON.parse(request.responseText));
      }
    }
  };
  request.onerror = function() { reject(request.statusText); };
  request.send(null);
};

/**
 * deleteJSON
 *
 * @param {string} url
 * @param {object} data 
 * @param {function} resolve 
 * @param {function} reject 
 */
const deleteJSON = function(url, data, resolve, reject) {
  const request = new XMLHttpRequest();
  request.open("DELETE", url + "?" + std.urlencode_rfc3986(data));
  request.onreadystatechange = function() {
    if (request.readyState === 4) {
      if (request.status === 200) {
        const type = request.getResponseHeader("Content-Type");
        if (type && type.indexOf("xml") !== -1 && request.responseXML) {
          resolve(request.responseXML);
        } else if (type === "application/json; charset=utf-8") {
          resolve(JSON.parse(request.responseText));
        } else {
          resolve(request.responseText);
        }
      } else {
        reject(JSON.parse(request.responseText));
      }
    }
  };
  request.onerror = function() { reject(JSON.parse(request.statusText)); };
  request.send(null);
};

/**
 * post
 *
 * @param {string} url 
 * @param {object} data 
 * @param {function} resolve 
 * @param {function} reject 
*/
const post = function(url, data, resolve, reject) {
  const request = new XMLHttpRequest();
  request.open("POST", url);
  request.onreadystatechange = function() {
    if (request.readyState === 4) {
      if (request.status === 200) {
        const type = request.getResponseHeader("Content-Type");
        if (type && type.indexOf("xml") !== -1 && request.responseXML) {
          resolve(request.responseXML);
        } else if (type === "application/json; charset=utf-8") {
          resolve(JSON.parse(request.responseText));
        } else {
          resolve(request.responseText);
        }
      } else {
        reject(request.responseText);
      }
    }
  };
  request.onerror = function() { reject(request.statusText); };
  request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  request.send(std.urlencode_rfc3986(data));
};

/**
 * getData
 *
 * @param {string} url 
 * @param {object} data 
 * @param {function} resolve 
 * @param {function} reject 
 */
const getData = function(url, data, resolve, reject) {
  const request = new XMLHttpRequest();
  request.open("GET", url + "?" + std.urlencode_rfc3986(data));
  request.onreadystatechange = function() {
    if (request.readyState === 4) {
      if (request.status === 200) {
        const type = request.getResponseHeader("Content-Type");
        if (type === "text/xml; charset=utf-8") {
          resolve(request.responseXML);
        } else if (type === "application/json; charset=utf-8") {
          resolve(JSON.parse(request.responseText));
        } else {
          resolve(request.responseText);
        }
      } else {
        reject(request.responseText);
      }
    }
  };
  request.onerror = function() { reject(request.statusText); };
  request.send(null);
};

/**
 * postData
 *
 * @param {string} url 
 * @param {object} data 
 * @param {function} resolve 
 * @param {function} reject 
*/
const postData = function(url, data, resolve, reject) {
  const request = new XMLHttpRequest();
  request.open("POST", url);
  request.onreadystatechange = function() {
    if (request.readyState === 4) {
      if (request.status === 200) {
        const type = request.getResponseHeader("Content-Type");
        if (type === "text/xml; charset=utf-8") {
          resolve(request.responseXML);
        } else if (type === "application/json; charset=utf-8") {
          resolve(JSON.parse(request.responseText));
        } else {
          resolve(request.responseText);
        }
      } else {
        reject(request.responseText);
      }
    }
  };
  request.onerror = function() { reject(request.statusText); };
  request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  request.send(std.urlencode_rfc3986(data));
};

/**
 * postXML
 *
 * @param {string} url 
 * @param {object} data 
 * @param {function} resolve 
 * @param {function} reject 
 */
const postXML = function(url, data, resolve, reject) {
  const request = new XMLHttpRequest();
  request.open("POST", url);
  request.onreadystatechange = function() {
    if (request.readyState === 4) {
      if (request.status === 200) {
        const type = request.getResponseHeader("Content-Type");
        if (type === "text/xml; charset=utf-8") {
          resolve(request.responseXML);
        } else if (type === "application/json; charset=utf-8") {
          resolve(JSON.parse(request.responseText));
        } else {
          resolve(request.responseText);
        }
      } else {
        reject(request.responseText);
      }
    }
  };
  request.onerror = function() { reject(request.statusText); };
  request.setRequestHeader("Content-Type", "text/xml; charset=UTF-8");
  for(let key in data.head) { request.setRequestHeader(key, data.head[key]); }
  request.send(data.body);
};

/**
 * postJSON
 *
 * @param {string} url 
 * @param {object} data 
 * @param {function} resolve 
 * @param {function} reject 
 */
const postJSON = function(url, data, resolve, reject) {
  const request = new XMLHttpRequest();
  request.open("POST", url);
  request.onreadystatechange = function() {
    if (request.readyState === 4) {
      if (request.status === 200) {
        const type = request.getResponseHeader("Content-Type");
        if (type === "text/xml; charset=utf-8") {
          resolve(request.responseXML);
        } else if (type === "application/json; charset=utf-8") {
          resolve(JSON.parse(request.responseText));
        } else {
          resolve(request.responseText);
        }
      } else {
        reject(JSON.parse(request.responseText));
      }
    }
  };
  request.onerror = function() { reject(request.statusText); };
  request.setRequestHeader("Content-Type", "application/json");
  request.send(JSON.stringify(data));
};

/**
 * putJSON
 *
 * @param {string} url 
 * @param {object} data 
 * @param {function} resolve 
 * @param {function} reject 
 */
const putJSON = function(url, data, resolve, reject) {
  const request = new XMLHttpRequest();
  request.open("PUT", url);
  request.onreadystatechange = function() {
    if (request.readyState === 4) {
      if (request.status === 200 || request.status === 201) {
        const type = request.getResponseHeader("Content-Type");
        if (type === "text/xml; charset=utf-8") {
          resolve(request.responseXML);
        } else if (type === "application/json; charset=utf-8") {
          resolve(JSON.parse(request.responseText));
        } else {
          resolve(request.responseText);
        }
      } else {
        reject(JSON.parse(request.responseText));
      }
    }
  };
  request.onerror = function() { reject(request.statusText); };
  request.setRequestHeader("Content-Type", "application/json");
  request.send(JSON.stringify(data));
};

/**
 * putFile
 *
 * @param {string} url 
 * @param {object} data 
 * @param {function} resolve 
 * @param {function} reject 
 */
const putFile = function(url, file, resolve, reject) {
  const request = new XMLHttpRequest();
  request.open("PUT", url);
  request.onreadystatechange = function() {
    if (request.readyState === 4) {
      if (request.status === 200) {
        const type = request.getResponseHeader("Content-Type");
        if (type === "text/xml; charset=utf-8") {
          resolve(request.responseXML);
        } else if (type === "application/json; charset=utf-8") {
          resolve(JSON.parse(request.responseText));
        } else {
          resolve(request.responseText);
        }
      } else {
        reject(JSON.parse(request.responseText));
      }
    }
  };
  request.onerror = function() { reject(request.statusText); };
  request.setRequestHeader("x-uploadedfilename", file.name);
  request.setRequestHeader("x-uploadedfiletype", file.type)
  request.send(file.content);
};

/**
 * getFile
 *
 * @param {string} url
 * @param {object} data 
 * @param {function} resolve 
 * @param {function} reject 
 */
const getFile = (url, data, resolve, reject) => {
  const request = new XMLHttpRequest();
  request.open("GET", url + "?" + std.urlencode_rfc3986(data), true);
  request.responseType = 'blob';
  request.onload = () => {
    const blob = request.response;
    resolve(blob);
  };
  request.onerror = () => reject(request.statusText);
  request.setRequestHeader("Content-Type", "application/json");
  request.send();
};

/**
 * postFile
 *
 * @param {string} url 
 * @param {object} data 
 * @param {function} resolve 
 * @param {function} reject 
 */
const postFile = (url, data, resolve, reject) => {
  const request = new XMLHttpRequest();
  request.open("POST", url, true);
  request.responseType = 'blob';
  request.onload = () => {
    const blob = request.response;
    resolve(blob);
  };
  request.onerror = () => reject(request.statusText);
  request.setRequestHeader("Content-Type", "application/json");
  request.send(JSON.stringify(data));
};

export default { 
  get, post
, getJSON, postJSON, putJSON, deleteJSON
, getData, postData
, postXML
, putFile, getFile, postFile
};
