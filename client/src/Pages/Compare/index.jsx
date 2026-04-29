import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { MyContext } from "../../App";
import { IoGitCompareOutline } from "react-icons/io5";
import { MdClose } from "react-icons/md";
import { formatPrice } from "../../utils/currency";
import Rating from "@mui/material/Rating";
import Button from "@mui/material/Button";
import { MdOutlineShoppingCart } from "react-icons/md";
import { FaRegHeart } from "react-icons/fa";
import { IoMdHeart } from "react-icons/io";
import { postData } from "../../utils/api";

const Compare = () => {
  const context = useContext(MyContext);

  const handleAddToMyList = (item) => {
    if (context?.userData === null) {
      context?.alertBox("error", "you are not login please login first");
      return false;
    } else {
      const obj = {
        productId: item?._id,
        userId: context?.userData?._id,
        productTitle: item?.name,
        image: item?.images?.[0],
        rating: item?.rating,
        price: item?.price,
        oldPrice: item?.oldPrice,
        brand: item?.brand,
        discount: item?.discount
      };

      postData("/api/myList/add", obj).then((res) => {
        if (res?.error === false) {
          context?.alertBox("success", res?.message);
          context?.getMyListData();
        } else {
          context?.alertBox("error", res?.message);
        }
      });
    }
  };

  const isInMyList = (productId) => {
    return context?.myListData?.some(item => item.productId.includes(productId));
  };

  if (!context?.compareData || context?.compareData.length === 0) {
    return (
      <section className="py-8 bg-white min-h-screen">
        <div className="container">
          <div className="text-center py-16">
            <IoGitCompareOutline className="text-[80px] text-gray-300 mx-auto mb-4" />
            <h2 className="text-[24px] font-[600] mb-2">No Products to Compare</h2>
            <p className="text-gray-600 mb-6">Add products to compare to see them side by side</p>
            <Link to="/products">
              <Button className="btn-org">Browse Products</Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 bg-white min-h-screen">
      <div className="container">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-[24px] lg:text-[28px] font-[600]">Compare Products</h1>
          <Button
            onClick={() => {
              context?.setCompareData([]);
              context?.alertBox("success", "Compare list cleared");
            }}
            className="!text-primary !border !border-primary"
          >
            Clear All
          </Button>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Product Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {context?.compareData?.map((product) => (
                <div key={product._id} className="bg-white border border-gray-200 rounded-lg p-4 relative">
                  {/* Remove Button */}
                  <button
                    onClick={() => context?.removeFromCompare(product._id)}
                    className="absolute top-2 right-2 w-[30px] h-[30px] rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors z-10"
                  >
                    <MdClose className="text-[18px] text-gray-600" />
                  </button>

                  {/* Product Image */}
                  <div className="w-full h-[200px] mb-4 overflow-hidden rounded-md bg-gray-50 flex items-center justify-center">
                    <img
                      src={product.images?.[0]}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="space-y-2">
                    <h3 className="text-[16px] font-[600] line-clamp-2 min-h-[48px]">
                      <Link to={`/product/${product._id}`} className="link">
                        {product.name}
                      </Link>
                    </h3>

                    <div className="flex items-center gap-2">
                      <Rating value={product.rating} size="small" readOnly />
                      <span className="text-[12px] text-gray-500">({product.rating})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {product.discount > 0 ? (
                        <>
                          <span className="oldPrice line-through text-gray-500 text-[14px]">
                            {formatPrice(product.oldPrice)}
                          </span>
                          <span className="price text-primary text-[18px] font-[600]">
                            {formatPrice(product.price)}
                          </span>
                          <span className="bg-primary text-white text-[12px] px-2 py-1 rounded">
                            -{product.discount}%
                          </span>
                        </>
                      ) : (
                        <span className="price text-primary text-[18px] font-[600]">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>

                    {product.brand && (
                      <p className="text-[13px] text-gray-600">
                        <span className="font-[500]">Brand:</span> {product.brand}
                      </p>
                    )}

                    {/* Sizes */}
                    {product.size && product.size.length > 0 && (
                      <div>
                        <p className="text-[12px] font-[500] mb-1">Sizes:</p>
                        <div className="flex flex-wrap gap-1">
                          {product.size.map((size, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] bg-gray-100 px-2 py-1 rounded"
                            >
                              {size}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col gap-2 mt-4">
                      <Link to={`/product/${product._id}`} className="w-full">
                        <Button className="btn-org w-full">
                          <MdOutlineShoppingCart className="text-[18px]" /> View Product
                        </Button>
                      </Link>
                      <Button
                        className="!border !border-gray-300 w-full"
                        onClick={() => handleAddToMyList(product)}
                      >
                        {isInMyList(product._id) ? (
                          <IoMdHeart className="text-[18px] !text-primary" />
                        ) : (
                          <FaRegHeart className="text-[18px]" />
                        )}
                        Wishlist
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Comparison Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <h3 className="text-[18px] font-[600] p-4 border-b border-gray-200">
                Detailed Comparison
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="p-3 font-[600] bg-gray-50 w-[150px]">Product Name</td>
                      {context?.compareData?.map((product) => (
                        <td key={product._id} className="p-3">
                          {product.name}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="p-3 font-[600] bg-gray-50">Price</td>
                      {context?.compareData?.map((product) => (
                        <td key={product._id} className="p-3">
                          <span className="text-primary font-[600]">
                            {formatPrice(product.price)}
                          </span>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="p-3 font-[600] bg-gray-50">Rating</td>
                      {context?.compareData?.map((product) => (
                        <td key={product._id} className="p-3">
                          <Rating value={product.rating} size="small" readOnly />
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="p-3 font-[600] bg-gray-50">Brand</td>
                      {context?.compareData?.map((product) => (
                        <td key={product._id} className="p-3">
                          {product.brand || "N/A"}
                        </td>
                      ))}
                    </tr>
                    {context?.compareData?.some(p => p.discount > 0) && (
                      <tr className="border-b border-gray-200">
                        <td className="p-3 font-[600] bg-gray-50">Discount</td>
                        {context?.compareData?.map((product) => (
                          <td key={product._id} className="p-3">
                            {product.discount > 0 ? `${product.discount}%` : "No discount"}
                          </td>
                        ))}
                      </tr>
                    )}
                    {context?.compareData?.some(p => p.size && p.size.length > 0) && (
                      <tr className="border-b border-gray-200">
                        <td className="p-3 font-[600] bg-gray-50">Sizes</td>
                        {context?.compareData?.map((product) => (
                          <td key={product._id} className="p-3">
                            {product.size && product.size.length > 0
                              ? product.size.join(", ")
                              : "N/A"}
                          </td>
                        ))}
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Compare;

