import React,{useContext,useEffect, useState } from "react";
import "../ProductItem/style.css";
import { Link } from "react-router-dom";
import Rating from "@mui/material/Rating";
import Button from "@mui/material/Button";
import { FaRegHeart } from "react-icons/fa";
import { IoGitCompareOutline } from "react-icons/io5";
import { MdZoomOutMap } from "react-icons/md";
import { MyContext } from "../../App";
import { postData } from "../../utils/api";
import { IoMdHeart } from "react-icons/io";
import { formatPrice } from "../../utils/currency";

const ProductItem = (props) => {

    const [isAddedInMyList, setIsAddedInMyList] = useState(false);
    const [isInCompare, setIsInCompare] = useState(false);


    const context = useContext(MyContext);

    // Cards no longer add to cart: clicking the picture or name opens the product page,
    // which is the single place to pick a size and add to cart.

    useEffect(() => {
      const myListItem = context?.myListData?.filter((item) =>
        item.productId.includes(props?.item?._id)
      )

      if (myListItem?.length !== 0) {
        setIsAddedInMyList(true);
      } else {
        setIsAddedInMyList(false)
      }

    }, [context?.myListData]);

    useEffect(() => {
      const isInCompareList = context?.compareData?.some(item => item._id === props?.item?._id);
      setIsInCompare(isInCompareList || false);
    }, [context?.compareData, props?.item?._id]);


    const handleAddToMyList = (item) => {
      if (context?.userData === null) {
        context?.alertBox("error", "you are not login please login first");
        return false
      }

      else {
        const obj = {
          productId: item?._id,
          userId: context?.userData?._id,
          productTitle: item?.name,
          image: item?.images[0],
          rating: item?.rating,
          price: item?.price,
          oldPrice: item?.oldPrice,
          brand: item?.brand,
          discount: item?.discount
        }


        postData("/api/myList/add", obj).then((res) => {
          if (res?.error === false) {
            context?.alertBox("success", res?.message);
            setIsAddedInMyList(true);
            context?.getMyListData();
          } else {
            context?.alertBox("error", res?.message);
          }
        })

      }
    }

  return (
    <div className="productItem p-4 shadow-md bg-[#f1f1f1] rounded-md overflow-hidden border-1 border-[rgba(0,0,0,0.1)] flex items-center flex-col lg:flex-row">
      <div className="group imgWrapper w-full lg:w-[25%]  overflow-hidden  rounded-md relative">
        <Link to={`/product/${props?.item?._id}`}>
          <div className="img  overflow-hidden">
            <img
              src={props?.item?.images[0]}
              className="w-full"
            />

           {
              props?.item?.images?.length > 1 &&
              <img
                src={props?.item?.images[1]}
                className="w-full transition-all duration-700 absolute top-0 left-0 opacity-0 group-hover:opacity-100 group-hover:scale-105"
              />
            }

          </div>
        </Link>


        {props?.item?.discount > 0 && (
          <span className="discount flex items-center absolute top-[10px] left-[10px] z-50 bg-primary text-white rounded-lg p-1 text-[12px] font-[500]">
            {props?.item?.discount}%
          </span>
        )}

        <div className="actions absolute top-[-20px] right-[5px] z-50 flex items-center gap-2 flex-col w-[50px] transition-all duration-300 group-hover:top-[15px] opacity-0 group-hover:opacity-100">

          <Button className="!w-[35px] !h-[35px] !min-w-[35px] !rounded-full !bg-white  text-black hover:!bg-primary hover:text-white group" onClick={() => context.handleOpenProductDetailsModal(true, props?.item)}>
            <MdZoomOutMap className="text-[18px] !text-black group-hover:text-white hover:!text-white" />
          </Button>

          <Button
            className={`!w-[35px] !h-[35px] !min-w-[35px] !rounded-full !bg-white text-black hover:!bg-primary hover:text-white group ${isInCompare ? '!bg-primary' : ''}`}
            onClick={() => {
              if (isInCompare) {
                context?.removeFromCompare(props?.item?._id);
              } else {
                context?.addToCompare(props?.item);
              }
            }}
          >
            <IoGitCompareOutline className={`text-[18px] ${isInCompare ? '!text-white' : '!text-black group-hover:text-white hover:!text-white'}`} />
          </Button>

          <Button className={`!w-[35px] !h-[35px] !min-w-[35px] !rounded-full !bg-white  text-black hover:!bg-primary hover:text-white group`}
            onClick={() => handleAddToMyList(props?.item)}
          >
            {
              isAddedInMyList === true ? <IoMdHeart  className="text-[18px] !text-primary group-hover:text-white hover:!text-white"/> :
                <FaRegHeart className="text-[18px] !text-black group-hover:text-white hover:!text-white" />

            }

          </Button>
        </div>
      </div>

      <div className="info p-3 py-5 pb-0 px-3 lg:px-8  w-full lg:w-[75%]">
        <h6 className="text-[15px] !font-[400]">
          <Link to="/" className="link transition-all">
           {props?.item?.brand}
          </Link>
        </h6>
        <h3 className="text-[18px] title mt-3 font-[500] mb-1 text-[#000]" style={{lineHeight:'25px'}}>
          <Link to={`/product/${props?.item?._id}`} className="link transition-all">
           {props?.item?.name}
          </Link>
        </h3>

        <p className="text-[14px] mb-3 whitespace-pre-line">
         {props?.item?.description}
        </p>

        <Rating name="size-small" value={props?.item?.rating} size="small" readOnly />

        <div className="flex items-center gap-4">
          {props?.item?.discount > 0 ? (
            <>
              <span className="oldPrice line-through text-gray-500 text-[15px] font-[500]">
                {formatPrice(props?.item?.oldPrice)}
              </span>
              <span className="price text-primary text-[15px]  font-[600]">
                {formatPrice(props?.item?.price)}
              </span>
            </>
          ) : (
            <span className="price text-primary text-[15px]  font-[600]">
              {formatPrice(props?.item?.price)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductItem;
