import React from "react";
import "../bannerBoxV2/style.css";
import { Link } from "react-router-dom";
import { formatPrice } from "../../utils/currency";

const BannerBoxV2 = (props) => {
  return (
    <div className="bannerBoxV2 box w-full overflow-hidden rounded-md group relative flex items-center justify-center bg-gray-50">
      <img
        src={props.image}
        className="w-full h-full object-contain transition-all duration-150 group-hover:scale-[1.02]"
        alt={props?.item?.bannerTitle || "Banner"}
      />

      <div
        className={`info absolute p-5 top-0 ${props.info === "left" ? "left-0" : "right-0"
          } w-[70%] h-[100%] z-50 flex items-center justify-center flex-col gap-2 
         ${props.info === "left" ? '' : 'pl-16'}`}
      >
        {props?.item?.bannerTitle && props?.item?.bannerTitle !== '' && (
          <h2 className="text-[14px] md:text-[18px] font-[600]">{props?.item?.bannerTitle}</h2>
        )}

        {props?.item?.price && props?.item?.price !== '' && props?.item?.price !== null && (
          <span className="text-[20px] text-primary font-[600] w-full">
            {formatPrice(props?.item?.price)}
          </span>
        )}

        <div className="w-full">
          {
            props?.item?.subCatId !== undefined && props?.item?.subCatId !== null ?
              <Link to={`/products?subCatId=${props?.item?.subCatId}`} className="text-[16px] font-[600] link">SHOP NOW</Link>
              :

              <Link to={`/products?catId=${props?.item?.catId}`} className="text-[16px] font-[600] link">SHOP NOW</Link>

          }


        </div>
      </div>
    </div>
  );
};

export default BannerBoxV2;
