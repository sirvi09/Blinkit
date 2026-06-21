import React, { useEffect, useState } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import uploadImage from "../utils/UploadImage";
import Loading from "../components/Loading";
import { MdDelete } from "react-icons/md";
import ViewImage from "../components/ViewImage";
import { useSelector } from "react-redux";
import { IoClose } from "react-icons/io5";
import AddFieldComponent from "../components/AddFieldComponent";
import SummaryApi from "../common/SummaryApi";
import Axios from "../utils/Axios";
import AxiosToastError from "../utils/AxiosToastError";
import successAlert from "../utils/SuccessAlert";

const UploadProduct = () => {
  const [data, setData] = useState({
    name: "",
    image: [],
    category: [],
    subCategory: [],
    unit: "",
    stock: "",
    price: "",
    discount: "",
    description: "",
    more_details: {},
  });

  const [imageloading, setImageLoading] = useState(false);
  const [veiwImageURL, setViewImageURL] = useState();
  const allCategory = useSelector((state) => state.product.allCategory) || [];
  const [selectCategory, setSelectCategory] = useState("");
  const [selectSubCategory, setSelectSubCategory] = useState("");
  const allSubcategory =
    useSelector((state) => state.product.allSubCategory) || [];

  const [moreField, setMoreField] = useState([]);
  const [openAddField, setOpenAddField] = useState(false);
  const [fieldName, setFeildName] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setData((preve) => {
      return {
        ...preve,
        [name]: value,
      };
    });
  };

  const handleDeleteImage = async (index) => {
    const updatedImages = [...data.image];
    updatedImages.splice(index, 1);

    setData((preve) => {
      return {
        ...preve,
        image: updatedImages,
      };
    });
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }

    try {
      setImageLoading(true);

      const response = await uploadImage(file);
      const { data: ImageResponse } = response;

      const imageUrl = ImageResponse?.data?.url || "";

      setData((preve) => {
        return {
          ...preve,
          image: [...preve.image, imageUrl],
        };
      });
    } catch (error) {
      console.log(error);
    } finally {
      setImageLoading(false);
    }
  };

  const handleRemoveCategory = async (index) => {
    const updated = [...data.category];
    updated.splice(index, 1);

    setData((preve) => {
      return {
        ...preve,
        category: updated,
      };
    });
  };

  const handleRemoveSubCategory = async (index) => {
    const updated = [...data.subCategory];
    updated.splice(index, 1);

    setData((preve) => {
      return {
        ...preve,
        subCategory: updated,
      };
    });
  };
  const handleAddField = async () => {
    setData((preve) => {
      return {
        ...preve,
        more_details: {
          ...preve.more_details,
          [fieldName]: "",
        },
      };
    });
    setFeildName("");
    setOpenAddField(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("data", data);
    try {
      const response = await Axios({
        ...SummaryApi.createProduct,
        data: data,
      });

      const { data: responseData } = response;

      if (responseData.success) {
        successAlert(responseData.message);
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  // useEffect(() => {
  //   successAlert("Upload successfully");
  // }, []);
  return (
    <section className="">
      <div className="p-2 bg-white shadow-md flex items-center justify-between">
        <h2 className="font-semibold">Upload Product</h2>
      </div>

      <div className="grid p-3">
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-1">
            <label htmlFor="name" className="font-medium">
              Name
            </label>
            <input
              type="text"
              placeholder="Enter product name"
              name="name"
              value={data.name}
              onChange={handleChange}
              required
              className="bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded"
            />
          </div>

          <div className="grid gap-1 ">
            <label htmlFor="description" className="font-medium">
              Description
            </label>
            <textarea
              id="description"
              placeholder="Enter product description"
              name="description"
              value={data.description}
              onChange={handleChange}
              required
              rows={3}
              className="bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded"
            />
          </div>

          <div>
            <p className="font-medium">Image</p>
            <div>
              <label
                htmlFor="productImage"
                className="bg-neutral-100 h-24 border rounded flex justify-center items-center cursor-pointer"
              >
                <div className="text-center flex justify-center items-center flex-col">
                  {imageloading && <Loading />}
                  <FaCloudUploadAlt size={28} />
                  <p>Upload Image</p>
                </div>
                <input
                  type="file"
                  id="productImage"
                  className="hidden"
                  accept="image/*"
                  onChange={handleUploadImage}
                />
              </label>

              <div className="flex flex-wrap gap-4">
                {data.image.map((img, index) => {
                  return (
                    <div
                      key={img + index}
                      className="h-20 mt-1 w-20 min-w-20 bg-blue-50 border relative group"
                    >
                      <img
                        src={img}
                        alt={img}
                        className="w-full h-full object-scale-down"
                        onClick={() => setViewImageURL(img)}
                      />
                      <div
                        onClick={() => handleDeleteImage(index)}
                        className="absolute bottom-0 right-0 p-1 bg-red-500 hover:bg-red-600 rounded text-white hidden group-hover:block cursor-pointer"
                      >
                        <MdDelete />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid gap-1">
            <label className="font-medium">Category</label>
            <select
              className="bg-blue-50 border w-full p-2 rounded"
              value={selectCategory}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                const category = allCategory.find((el) => el.id === value);

                if (!category) return;

                setData((preve) => {
                  return {
                    ...preve,
                    category: [...preve.category, category],
                  };
                });
                setSelectCategory("");
              }}
            >
              <option value={""}>Select Category</option>
              {allCategory.map((c) => {
                return (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                );
              })}
            </select>

            <div className="flex flex-wrap gap-3">
              {data.category.map((c, index) => {
                return (
                  <div
                    key={c.id + index}
                    className="text-sm flex items-center gap-1 bg-blue-50 mt-2"
                  >
                    <p>{c.name}</p>
                    <div
                      className="hover:text-red-500 cursor-pointer"
                      onClick={() => handleRemoveCategory(index)}
                    >
                      <IoClose size={20} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-1">
            <label>Sub Category</label>
            <select
              className="bg-blue-50 border w-full p-2 rounded"
              value={selectSubCategory}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                const sub = allSubcategory.find((el) => el.id === value);

                if (!sub) return;

                setData((preve) => {
                  return {
                    ...preve,
                    subCategory: [...preve.subCategory, sub],
                  };
                });
                setSelectSubCategory("");
              }}
            >
              <option value={""} className="text-neutral-600">
                Select Sub Category
              </option>
              {allSubcategory.map((c, index) => {
                return <option value={c?.id}>{c.name}</option>;
              })}
            </select>

            <div className="flex flex-wrap gap-3">
              {data.subCategory.map((c, index) => {
                return (
                  <div
                    key={c.id + index + "subCategorySection"}
                    className="text-sm flex items-center gap-1 bg-blue-50 mt-2"
                  >
                    <p>{c.name}</p>
                    <div
                      className="hover:text-red-500 cursor-pointer"
                      onClick={() => handleRemoveSubCategory(index)}
                    >
                      <IoClose size={20} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="grid gap-1">
            <label htmlFor="unit" className="font-medium">
              Unit
            </label>
            <input
              type="text"
              id="unit"
              placeholder="Enter product unit"
              name="unit"
              value={data.unit}
              onChange={handleChange}
              required
              className="bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded"
            />
          </div>
          <div className="grid gap-1">
            <label htmlFor="stock" className="font-medium">
              Stock
            </label>
            <input
              type="text"
              id="stock"
              placeholder="Enter product stock"
              name="stock"
              value={data.stock}
              onChange={handleChange}
              required
              className="bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded"
            />
          </div>
          <div className="grid gap-1">
            <label htmlFor="price" className="font-medium">
              Price
            </label>
            <input
              type="text"
              id="price"
              placeholder="Enter product price"
              name="price"
              value={data.price}
              onChange={handleChange}
              required
              className="bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded"
            />
          </div>
          <div className="grid gap-1">
            <label htmlFor="discount" className="font-medium">
              Discount
            </label>
            <input
              type="text"
              id="discount"
              placeholder="Enter product discount"
              name="discount"
              value={data.discount}
              onChange={handleChange}
              required
              className="bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded"
            />
          </div>

          {Object?.keys(data?.more_details)?.map((k, index) => {
            return (
              <div className="grid gap-1">
                <label htmlFor={k} className="font-medium">
                  {k}
                </label>
                <input
                  type="text"
                  id={k}
                  placeholder="Enter product discount"
                  value={data.more_details[k] || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setData((preve) => {
                      return {
                        ...preve,
                        more_details: {
                          ...preve.more_details,
                          [k]: value,
                        },
                      };
                    });
                  }}
                  required
                  className="bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded"
                />
              </div>
            );
          })}

          <div
            onClick={() => setOpenAddField(true)}
            className="bg-primary-200 hover:bg-white py-1 px-3 w-32 text-center font-semibold border border-primary-200 hover:text-neutral-900 cursor-pointer rounded"
          >
            Add Fields
          </div>
          <button className="bg-primary-100 hover:bg-primary-200 py-2 rounded font-semibold">
            Submit
          </button>
        </form>
      </div>

      {veiwImageURL && (
        <ViewImage url={veiwImageURL} close={() => setViewImageURL("")} />
      )}
      {openAddField && (
        <AddFieldComponent
          value={fieldName}
          onChange={(e) => setFeildName(e.target.value)}
          submit={handleAddField}
          close={() => setOpenAddField(false)}
        />
      )}
    </section>
  );
};

export default UploadProduct;
