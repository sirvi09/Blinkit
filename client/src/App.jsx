import { useEffect } from 'react'
import './App.css'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import toast, { Toaster } from 'react-hot-toast'
import fetchUserDetails from './utils/fetchUserDetails'
import { setUserDetails } from './store/userSlice'
import { useDispatch } from 'react-redux'
import { setAllcategory, setAllSubcategory,setLoadingCategory} from './store/productSlice'
import Axios from './utils/Axios'
import SummaryApi from './common/SummaryApi'
import { handleAddItemCart } from './store/cartProduct'
import GlobalProvider from './provider/GlobalProvider'
import { FaCartShopping } from 'react-icons/fa6'
import CartMobileLink from './components/CartMobile'

function App() {
  const dispatch = useDispatch()
  const location = useLocation();

  const fetchUser = async () => {
    try {
      const userData = await fetchUserDetails();

      if (userData?.success) {
        dispatch(setUserDetails(userData.data));
      }
    } catch (error) {}
  };

  const fetchCategory = async () => {
    try {
      dispatch(setLoadingCategory(true))
      const res = await Axios({
        ...SummaryApi.getCategory,
      });

      const { data: responseData } = res;

      if (responseData.success) {
        dispatch(setAllcategory(responseData.data)); 
      }

    } catch (error) {
    }finally{
      dispatch(setLoadingCategory(false))
    }
  };

  const fetchSubCategory = async () => {
    try {
      const res = await Axios({
        ...SummaryApi.getSubCategory,
      });

      const { data: responseData } = res;

      if (responseData.success) {
        dispatch(setAllSubcategory(responseData.data)); 
      }

    } catch (error) {}
  };

  const fetchCartItem = async()=>{
    try{
      const res = await Axios({
        ...SummaryApi.getCartItem
      })
      const { data : responseData } = res

      if(responseData.success){
      dispatch(handleAddItemCart(responseData.data))
      }

    }catch(error){
      console.log(error)
    }
  }

  useEffect(() => {
    fetchUser();
    fetchCategory();
    fetchSubCategory();
    fetchCartItem();
  }, [location.pathname]);

  return (
    <GlobalProvider>
      <Header/>
      <main className='min-h-[78vh]'>
      <Outlet/>
      </main>
      <Footer/>
      <Toaster/>
      <div className='sticky bottom-4 p-2'>
        <CartMobileLink />
       </div>
    </GlobalProvider>
  )
}

export default App