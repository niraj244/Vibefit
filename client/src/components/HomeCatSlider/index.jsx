import React, { useContext } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import 'swiper/css/free-mode';

import { Navigation,FreeMode } from "swiper/modules";
import { Link } from "react-router-dom";
import { MyContext } from "../../App";

const HomeCatSlider = (props) => {

  const context = useContext(MyContext);

  return (
    <div className="homeCatSlider pt-0 lg:pt-4 py-4 lg:py-8">
      <div className="container">
        <Swiper
          slidesPerView={8}
          spaceBetween={10}
          navigation={context?.windowWidth < 992 ? false : true}
          modules={[Navigation, FreeMode]}
          freeMode={true}
          breakpoints={{
            300: {
              slidesPerView: 4,
              spaceBetween: 5,
            },
            550: {
              slidesPerView: 5,
              spaceBetween: 5,
            },
            900: {
              slidesPerView: 5,
              spaceBetween: 5,
            },
            1100: {
              slidesPerView: 8,
              spaceBetween: 5,
            },
          }}
          className="mySwiper"
        >
          {
            props?.data?.map((cat, index) => {
              return (
                <SwiperSlide key={index}>
                  <Link to={`/products?catId=${cat?._id}`}>
                    <div className="item h-[120px] lg:h-[140px] px-3 bg-white rounbded-sm text-center flex items-center justify-center flex-col cursor-pointer">
                      <div className="w-[40px] h-[40px] lg:w-[60px] lg:h-[60px] rounded-md overflow-hidden flex items-center justify-center flex-shrink-0 mb-2">
                        <img
                          src={cat?.images[0]}
                          className="w-full h-full object-contain transition-all"
                          alt={cat?.name}
                        />
                      </div>
                      <h3 className="text-[12px] lg:text-[15px] font-[500] w-full h-[40px] lg:h-[45px] flex items-center justify-center overflow-hidden text-ellipsis line-clamp-2" title={cat?.name}>{cat?.name}</h3>
                    </div>
                  </Link>
                </SwiperSlide>
              )
            })
          }


        </Swiper>
      </div>
    </div>
  );
};

export default HomeCatSlider;
