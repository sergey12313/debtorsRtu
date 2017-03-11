function resolvePromise() {
    return rejectPromise();
}

function rejectPromise() {
    return Promise.reject(new Error("123"));
}

resolvePromise().then(() => {
    console.log('resolved');
}).catch((err) => {
    console.log(err);
});/**
 * Created by sergey on 09.03.17.
 */
