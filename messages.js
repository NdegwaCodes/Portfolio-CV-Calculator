/*NdegwaCode*/
const Messages = Object.freeze({
    success: (token, value) => `latest portfolio value for ${token} : ${value}`,
    error: (error)=> `error : ${error}`
});

export default Messages;