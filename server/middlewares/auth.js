import jwt from 'jsonwebtoken'

const auth = async(request,response,next)=>{
    try {
        const token = request.cookies.accessToken || request?.headers?.authorization?.split(" ")[1];

        if(!token){
            return response.status(401).json({
                message : "Provide token"
            })
        }

        const decode = await jwt.verify(token,process.env.SECRET_KEY_ACCESS_TOKEN);

        if(!decode){
            return response.status(401).json({
                message : "unauthorized access",
                error : true,
                success : false
            })
        }

        request.userId = decode.id

        next()

    } catch (error) {
        // jwt.verify throws when the token is expired, malformed or signed with another key.
        // That is "not logged in" (401), not a server crash (500). The message is kept the same
        // so older deployed frontends that still match on it keep working.
        return response.status(401).json({
            message : "You have not login",
            error : true,
            success : false
        })
    }
}

export default auth