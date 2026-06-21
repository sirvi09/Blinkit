import SummaryApi from "../common/SummaryApi";
import Axios from "./Axios";

const fetchUserDetails = async() => {
    try{
        const res = await Axios({
            ...SummaryApi.userDetails
        })
        return res.data
    } catch (error){
        console.log(error)
    }
}

export default fetchUserDetails