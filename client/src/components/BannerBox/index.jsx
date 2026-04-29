import React from "react";
import { Link } from "react-router-dom";

const BannerBox = (props) => {
  return (
    <div className="box bannerBox overflow-hidden rounded-lg group flex items-center justify-center bg-gray-50 h-[250px]">
    {console.log(props?.item)}
      {
        props?.item?.subCatId !== undefined && props?.item?.subCatId !== null &&  props?.item?.subCatId !== ""  ?
          <Link to={`/products?subCatId=${props?.item?.subCatId}`} className="text-[16px] font-[600] link w-full h-full flex items-center justify-center">
            <img src={props.img} className="w-full h-full object-contain transition-all group-hover:scale-[1.02] group-hover:rotate-1" alt="banner" />
          </Link>
          :

          <Link to={`/products?catId=${props?.item?.catId}`} className="text-[16px] font-[600] link w-full h-full flex items-center justify-center">
        
            <img src={props.img} className="w-full h-full object-contain transition-all group-hover:scale-[1.02] group-hover:rotate-1" alt="banner" />
          </Link>

      }

    </div>
  );
};

export default BannerBox;
