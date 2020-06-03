const PENDING = 'pending';
const RESOLVED = 'resolved';
const REJECTED = 'rejected';

function Promise(executor) {
    
    const self = this;
    self.callbackObjs = [];
    self.status = PENDING;

    function resolve(value) {
        if (self.status !== PENDING) return;
        self.status = RESOLVED;
        self.data = value;
        if (self.callbackObjs.length) {
            setTimeout(() => {
                self.callbackObjs.forEach(callbackObj => {
                    callbackObj.onResolved(value)
                });
            });
        }
    }

    function reject(reason) {
        if (self.status !== PENDING) return;
        self.status = REJECTED;
        self.data = reason;
        if (self.callbackObjs.length) {
            setTimeout(() => {
                self.callbackObjs.forEach(callbackObj => {
                    callbackObj.onRejected(reason)
                });
            });
        }
    }
    try {
        executor(resolve, reject)
    } catch (error) {
        reject(error)
    }
}

Promise.prototype.then = function (onResolved, onRejected) {
    const self = this;

    return new Promise((resolve, reject) => {

        function hanlder(callback, data) {
            try {
                const result = callback(data);
                if (result instanceof Promise) {
                    result.then(resolve, reject)
                } else {
                    resolve(result)
                }
            } catch (error) {
                reject(error)
            }
        }

        if (self.status === RESOLVED) {
            setTimeout(() => {
                hanlder(onResolved, self.data)
            });
        } else if (self.status === REJECTED) {
            setTimeout(() => {
                hanlder(onRejected, self.data)
            });
        } else {
            self.callbackObjs.push({
                onResolved(value) {
                    hanlder(onResolved, value)
                },
                onRejected(reason) {
                    hanlder(onRejected, reason)
                }
            })
        }
    })
}