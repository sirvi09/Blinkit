import React from "react";
import banner from "../assets/banner.jpg";
import bannerMobile from "../assets/banner-mobile.jpg";
import { useSelector } from "react-redux";
import { valideURLConvert } from "../utils/validURLConvert";
import { useNavigate } from "react-router-dom";
import CategoryWiseProductDisplay from "../components/CategoryWiseProductDisplay";

function Home() {
  const navigate = useNavigate();
  const loadingCategory = useSelector((state) => state.product.loadingCategory);
  const categoryData = useSelector((state) => state.product.allCategory);
  const subCategoryData = useSelector((state) => state.product.allSubCategory);

  const handleRedirectProductListpage = (id, cat) => {
  console.log(id, cat);
  const subcategory = subCategoryData.find(
    (sub) => sub.category_id === id
  );

  if (!subcategory) return;

  console.log(subcategory);

  const url = `/${valideURLConvert(cat)}-${id}/${valideURLConvert(
    subcategory.name
  )}-${subcategory.id}`;

  navigate(url);

  console.log(url);
};

  return (
   <section className='bg-white'>
      <div className='container mx-auto'>
          <div className={`w-full h-full min-h-48 bg-blue-100 rounded ${!banner && "animate-pulse my-2" } `}>
              <img
                src={banner}
                className='w-full h-full hidden lg:block'
                alt='banner' 
              />
              <img
                src={bannerMobile}
                className='w-full h-full lg:hidden'
                alt='banner' 
              />
          </div>
      </div>
      
      <div className='container mx-auto px-4 my-2 flex flex-wrap justify-center gap-4'>
          {
            loadingCategory ? (
              new Array(12).fill(null).map((c,index)=>{
                return(
                  <div key={index+"loadingcategory"} className='bg-white rounded p-4 min-h-36 grid gap-2 shadow animate-pulse'>
                    <div className='bg-blue-100 min-h-24 rounded'></div>
                    <div className='bg-blue-100 h-8 rounded'></div>
                  </div>
                )
              })
            ) : (
              categoryData.map((cat,index)=>{
                return(
                  <div key={cat.id+"displayCategory"} className='w-24 md:w-28 cursor-pointer' onClick={()=>handleRedirectProductListpage(cat.id,cat.name)}>
                    <div>
                        <img 
                          src={cat.image}
                          className='w-full h-full object-scale-down'
                        />
                    </div>
                  </div>
                )
              })
              
            )
          }
      </div>
{/* display category product */}
{
  categoryData.map((cat) => (
    <CategoryWiseProductDisplay
      key={cat.id + "CategoryWiseProductDisplay"}
      id={cat.id}
      name={cat.name}
    />
  ))
}
    </section>
  );
}

export default Home;
