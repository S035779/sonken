/**
 * encodeFormData
 *
 * @param {object} data 
 * @returns {string}
 */
const encodeFormData = function(data) {
  if (!data) return ""
  let pairs = [];
  for(let name in data) {
    if (!data.hasOwnProperty(name)) continue;
    if (typeof data[name] === "function") continue;
    let value = data[name].toString();
    name = encodeURIComponent(name.replace(" ", "+"));
    value = encodeURIComponent(value.replace(" ", "+"));
    pairs.push(name + "=" + value);
  }
  return pairs.join('&');
};

/**
 * get
 *
 * @param {string} url
 * @param {object} data 
 * @param {function} success 
 * @param {function} error 
 */
const get = function(url, data, success, error) {
  const request = new XMLHttpRequest();
  request.open("GET", url + "?" + encodeFormData(data));
  request.onreadystatechange = function() {
    if (request.readyState === 4) {
      if (request.status === 200) {
        const type = request.getResponseHeader("Content-Type");
        if (type.indexOf("xml") !== -1 && request.responseXML) {
          success(request.responseXML);
        } else if (type === "application/json; charset=utf-8") {
          success(JSON.parse(request.responseText));
        } else {
          success(request.responseText);
        }
      } else {
        error(JSON.parse(request.responseText));
      }
    }
  };
  request.onerror = function(e) {
    error(request.statusText);
  };
  request.send(null);
};
module.exports.get = get;

/**
 * getJSON
 *
 * @param {string} url
 * @param {object} data 
 * @param {function} success 
 * @param {function} error 
 */
const getJSON = function(url, data, success, error) {
  const request = new XMLHttpRequest();
  request.open("GET", url + "?" + encodeFormData(data));
  request.onreadystatechange = function() {
    if (request.readyState === 4) {
      if (request.status === 200) {
        const type = request.getResponseHeader("Content-Type");
        if (type.indexOf("xml") !== -1 && request.responseXML) {
          success(request.responseXML);
        } else if (type === "application/json; charset=utf-8") {
          success(JSON.parse(request.responseText));
        } else {
          success(request.responseText);
        }
      } else {
        error(JSON.parse(request.responseText));
      }
    }
  };
  request.onerror = function(e) {
    error(request.statusText);
  };
  request.send(null);
};
module.exports.getJSON = getJSON;

/**
 * deleteJSON
 *
 * @param {string} url
 * @param {object} data 
 * @param {function} success 
 * @param {function} error 
 */
const deleteJSON = function(url, data, success, error) {
  const request = new XMLHttpRequest();
  request.open("DELETE", url + "?" + encodeFormData(data));
  request.onreadystatechange = function() {
    if (request.readyState === 4) {
      if (request.status === 200) {
        const type = request.getResponseHeader("Content-Type");
        if (type.indexOf("xml") !== -1 && request.responseXML) {
          success(request.responseXML);
        } else if (type === "application/json; charset=utf-8") {
          success(JSON.parse(request.responseText));
        } else {
          success(request.responseText);
        }
      } else {
        error(JSON.parse(request.responseText));
      }
    }
  };
  request.onerror = function(e) {
    error(JSON.parse(request.statusText));
  };
  request.send(null);
};
module.exports.deleteJSON = deleteJSON;

/**
 * post
 *
 * @param {string} url 
 * @param {object} data 
 * @param {function} success 
 * @param {function} error 
*/
const post = function(url, data, success, error) {
  const request = new XMLHttpRequest();
  request.open("POST", url);
  request.onreadystatechange = function() {
    if (request.readyState === 4) {
      if (request.status === 200) {
        const type = request.getResponseHeader("Content-Type");
        if (type.indexOf("xml") !== -1 && request.responseXML) {
          success(request.responseXML);
        } else if (type === "application/json; charset=utf-8") {
          success(JSON.parse(request.responseText));
        } else {
          success(request.responseText);
        }
      } else {
        error(request.responseText);
      }
    }
  };
  request.onerror = function(e) {
    error(request.statusText);
  };
  request.setRequestHeader("Content-Type"
    , "application/x-www-form-urlencoded");
  request.send(encodeFormData(data));
};
module.exports.post = post;

/**
 * getData
 *
 * @param {string} url 
 * @param {object} data 
 * @param {function} success 
 * @param {function} error 
 */
const getData = function(url, data, success, error) {
  const request = new XMLHttpRequest();
  request.open("GET", url + "?" + encodeFormData(data));
  request.onreadystatechange = function() {
    if (request.readyState === 4) {
      if (request.status === 200) {
        const type = request.getResponseHeader("Content-Type");
        if (type === "text/xml; charset=utf-8") {
          success(request.responseXML);
        } else if (type === "application/json; charset=utf-8") {
          success(JSON.parse(request.responseText));
        } else {
          success(request.responseText);
        }
      } else {
        error(request.responseText);
      }
    }
  };
  request.onerror = function(e) {
    error(request.statusText);
  };
  request.send(null);
};
module.exports.getData = getData;

/**
 * postData
 *
 * @param {string} url 
 * @param {object} data 
 * @param {function} success 
 * @param {function} error 
*/
const postData = function(url, data, success, error) {
  const request = new XMLHttpRequest();
  request.open("POST", url);
  request.onreadystatechange = function() {
    if (request.readyState === 4) {
      if (request.status === 200) {
        const type = request.getResponseHeader("Content-Type");
        if (type === "text/xml; charset=utf-8") {
          success(request.responseXML);
        } else if (type === "application/json; charset=utf-8") {
          success(JSON.parse(request.responseText));
        } else {
          success(request.responseText);
        }
      } else {
        error(request.responseText);
      }
    }
  };
  request.onerror = function(e) {
    error(request.statusText);
  };
  request.setRequestHeader("Content-Type"
    , "application/x-www-form-urlencoded");
  request.send(encodeFormData(data));
};
module.exports.postData = postData;

/**
 * postXML
 *
 * @param {string} url 
 * @param {object} data 
 * @param {function} success 
 * @param {function} error 
 */
const postXML = function(url, data, success, error) {
  const request = new XMLHttpRequest();
  request.open("POST", url);
  request.onreadystatechange = function() {
    if (request.readyState === 4) {
      if (request.status === 200) {
        const type = request.getResponseHeader("Content-Type");
        if (type === "text/xml; charset=utf-8") {
          success(request.responseXML);
        } else if (type === "application/json; charset=utf-8") {
          success(JSON.parse(request.responseText));
        } else {
          success(request.responseText);
        }
      } else {
        error(request.responseText);
      }
    }
  };
  request.onerror = function(e) {
    error(request.statusText);
  };
  request.setRequestHeader("Content-Type", "text/xml; charset=UTF-8");
  for(let key in data.head) {
    request.setRequestHeader(key, data.head[key]);
  }
  request.send(data.body);
};
module.exports.postXML = postXML;

/**
 * postJSON
 *
 * @param {string} url 
 * @param {object} data 
 * @param {function} success 
 * @param {function} error 
 */
const postJSON = function(url, data, success, error) {
  const request = new XMLHttpRequest();
  request.open("POST", url);
  request.onreadystatechange = function() {
    if (request.readyState === 4) {
      if (request.status === 200) {
        const type = request.getResponseHeader("Content-Type");
        if (type === "text/xml; charset=utf-8") {
          success(request.responseXML);
        } else if (type === "application/json; charset=utf-8") {
          success(JSON.parse(request.responseText));
        } else {
          success(request.responseText);
        }
      } else {
        error(JSON.parse(request.responseText));
      }
    }
  };
  request.onerror = function(e) {
    error(request.statusText);
  };
  request.setRequestHeader("Content-Type", "application/json");
  request.send(JSON.stringify(data));
};
module.exports.postJSON = postJSON;

/**
 * putJSON
 *
 * @param {string} url 
 * @param {object} data 
 * @param {function} success 
 * @param {function} error 
 */
const putJSON = function(url, data, success, error) {
  const request = new XMLHttpRequest();
  request.open("PUT", url);
  request.onreadystatechange = function() {
    if (request.readyState === 4) {
      if (request.status === 200) {
        const type = request.getResponseHeader("Content-Type");
        if (type === "text/xml; charset=utf-8") {
          success(request.responseXML);
        } else if (type === "application/json; charset=utf-8") {
          success(JSON.parse(request.responseText));
        } else {
          success(request.responseText);
        }
      } else {
        error(JSON.parse(request.responseText));
      }
    }
  };
  request.onerror = function(e) {
    error(request.statusText);
  };
  request.setRequestHeader("Content-Type", "application/json");
  request.send(JSON.stringify(data));
};
module.exports.putJSON = putJSON;

/**
 * putFile
 *
 * @param {string} url 
 * @param {object} data 
 * @param {function} success 
 * @param {function} error 
 */
const putFile = function(url, data, success, error) {
  const request = new XMLHttpRequest();
  request.open("PUT", url);
  request.onreadystatechange = function() {
    if (request.readyState === 4) {
      if (request.status === 200) {
        const type = request.getResponseHeader("Content-Type");
        if (type === "text/xml; charset=utf-8") {
          success(request.responseXML);
        } else if (type === "application/json; charset=utf-8") {
          success(JSON.parse(request.responseText));
        } else {
          success(request.responseText);
        }
      } else {
        error(JSON.parse(request.responseText));
      }
    }
  };
  request.onerror = function(e) {
    error(request.statusText);
  };
  request.setRequestHeader("x-uploadedfilename", data.filename);
  request.send(data.filedata);
};
module.exports.putFile = putFile;

/**
 * getFile
 *
 * @param {string} url
 * @param {object} data 
 * @param {function} success 
 * @param {function} error 
 */
const getFile = function(url, data, success, error) {
  const request = new XMLHttpRequest();
  request.open("GET", url + "?" + encodeFormData(data));
  request.onreadystatechange = function() {
    if (request.readyState === 4) {
      if (request.status === 200) {
        const type = request.getResponseHeader("Content-Type");
        if (type.indexOf("xml") !== -1 && request.responseXML) {
          success(request.responseXML);
        } else if (type === "application/json; charset=utf-8") {
          success(JSON.parse(request.responseText));
        } else if (type === "application/octet-stream") {
          const response = new Blob([request.response]
            , {type: "application/octet-stream"});
          success(response);
        } else {
          success(request.responseText);
        }
      } else {
        error(JSON.parse(request.responseText));
      }
    }
  };
  request.onerror = function(e) {
    error(request.statusText);
  };
  request.send(null);
};
module.exports.getFile = getFile;

/**
 * postFile
 *
 * @param {string} url 
 * @param {object} data 
 * @param {function} success 
 * @param {function} error 
 */
const postFile = function(url, data, success, error) {
  const request = new XMLHttpRequest();
  request.open("POST", url);
  request.onreadystatechange = function() {
    if (request.readyState === 4) {
      if (request.status === 200) {
        const type = request.getResponseHeader("Content-Type");
        if (type === "text/xml; charset=utf-8") {
          success(request.responseXML);
        } else if (type === "application/json; charset=utf-8") {
          success(JSON.parse(request.responseText));
        } else if (type === "application/octet-stream") {
          const response
            = new Blob([request.response], {type: "text/csv"});
          success(response);
        } else {
          success(request.responseText);
        }
      } else {
        error(JSON.parse(request.responseText));
      }
    }
  };
  request.onerror = function(e) {
    error(request.statusText);
  };
  request.setRequestHeader("Content-Type", "application/json");
  request.send(JSON.stringify(data));
};
module.exports.postFile = postFile;
