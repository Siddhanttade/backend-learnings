const asyncHandler = (reqHandler) => {
    return (req, res, next) => {
        Promise.resolve(reqHandler(req, res, next)).catch((err)=>next(err))
    }
}

export { asyncHandler };
 


//TRY-CATCH  with ASYNC AWAIT

//deriving the below line
// const asyncHandler=()=>{}
// const asyncHandler=(fn)=>()=>{}
// const asyncHandler=(fn)=>async()=>{}

// const asyncHandler = (fn) =>async (req,res,next)=>{
//     try {
//         await fn(req,res,next)
//     } catch (error) {
//         res.status(500||error.code).json({
//             success: false,
//             message: error.code
//         })
//     }
// }