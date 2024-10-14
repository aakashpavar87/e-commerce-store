import React from "react";
import useProductStore from "../store/useProductStore";
import { motion } from "framer-motion";
import { Star, Trash } from "lucide-react";

const ProductsList = () => {
  const { deleteProduct, toggleFeaturedProduct, products } = useProductStore();
  return (
    <motion.div
      className="bg-gray-800 shadow-lg rounded-lg max-w-4xl mx-auto p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      {products.length > 0 ? (
        <table className="min-w-full divide-y divide-gray-400">
          <thead className="bg-gray-700">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider"
                scope="col"
              >
                Product
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider"
                scope="col"
              >
                Price
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider"
                scope="col"
              >
                Category
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider"
                scope="col"
              >
                Featured
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider"
                scope="col"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {products?.map((product) => (
              <tr key={product?.id} className="hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img
                        className="h-10 w-10 rounded-full object-cover"
                        src={product?.image}
                        alt={product?.name}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-white">
                        {product?.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300">
                    ${product?.price?.toFixed(2)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300">
                    {product?.category}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => toggleFeaturedProduct(product?.id)}
                    className={`p-1 rounded-full ${
                      product?.isFeatured
                        ? "bg-yellow-400 text-gray-900"
                        : "bg-gray-600 text-gray-300"
                    } hover:bg-yellow-500 transition-colors duration-200`}
                  >
                    <Star className="h-5 w-5" />
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => deleteProduct(product?.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <h1 className="text-gray-200 text-3xl font-thin">
          You Don't have any products just create one !!!
        </h1>
      )}
    </motion.div>
  );
};

export default ProductsList;
