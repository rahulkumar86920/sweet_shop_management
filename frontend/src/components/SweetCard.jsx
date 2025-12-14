import React, { useState } from 'react';
import { sweetsAPI } from '../api/api.js';

const SweetCard = ({ sweet, isAdmin, onUpdate, onDelete, onPurchase }) => {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestocking, setIsRestocking] = useState(false);
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [restockQuantity, setRestockQuantity] = useState(10);

  const handlePurchase = async () => {
    if (purchaseQuantity < 1 || purchaseQuantity > sweet.quantity) return;
    
    try {
      setIsPurchasing(true);
      await sweetsAPI.purchase(sweet._id, purchaseQuantity);
      onPurchase();
    } catch (error) {
      alert(error.error || 'Purchase failed');
    } finally {
      setIsPurchasing(false);
      setPurchaseQuantity(1);
    }
  };

  const handleRestock = async () => {
    if (restockQuantity < 1) return;
    
    try {
      setIsRestocking(true);
      await sweetsAPI.restock(sweet._id, restockQuantity);
      onUpdate();
    } catch (error) {
      alert(error.error || 'Restock failed');
    } finally {
      setIsRestocking(false);
      setRestockQuantity(10);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group">
      {/* Sweet Image */}
      <div className="h-48 bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center relative overflow-hidden">
        {sweet.imageUrl ? (
          <img 
            src={sweet.imageUrl} 
            alt={sweet.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-6xl">🍬</span>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-block px-3 py-1 bg-white bg-opacity-90 backdrop-blur-sm text-gray-700 text-xs font-medium rounded-full shadow-sm">
            {sweet.category.charAt(0).toUpperCase() + sweet.category.slice(1)}
          </span>
        </div>

        {/* Stock Badge */}
        <div className="absolute top-3 right-3">
          {sweet.quantity === 0 ? (
            <span className="inline-block px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-full shadow-sm">
              Out of Stock
            </span>
          ) : sweet.quantity < 10 ? (
            <span className="inline-block px-3 py-1 bg-orange-500 text-white text-xs font-medium rounded-full shadow-sm">
              Low Stock
            </span>
          ) : null}
        </div>

        {/* Admin Actions Overlay */}
        {isAdmin && (
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <button
              onClick={() => onUpdate(sweet)}
              className="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-all shadow-lg"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(sweet._id)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all shadow-lg"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5">
        {/* Title and Description */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{sweet.name}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{sweet.description}</p>
        </div>

        {/* Price and Stats */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
          <div>
            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600">
              ₹{sweet.price.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {sweet.soldCount} sold
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-1">Available</p>
            <p className={`text-lg font-bold ${sweet.quantity === 0 ? 'text-red-600' : 'text-green-600'}`}>
              {sweet.quantity}
            </p>
          </div>
        </div>

        {/* Actions */}
        {!isAdmin ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max={sweet.quantity}
              value={purchaseQuantity}
              onChange={(e) => setPurchaseQuantity(parseInt(e.target.value) || 1)}
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center font-medium focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              disabled={sweet.quantity === 0}
            />
            <button
              onClick={handlePurchase}
              disabled={sweet.quantity === 0 || isPurchasing}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-medium rounded-lg hover:from-pink-600 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
            >
              {isPurchasing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Purchasing...
                </span>
              ) : (
                'Purchase'
              )}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              value={restockQuantity}
              onChange={(e) => setRestockQuantity(parseInt(e.target.value) || 10)}
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              onClick={handleRestock}
              disabled={isRestocking}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
            >
              {isRestocking ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Restocking...
                </span>
              ) : (
                'Restock'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SweetCard;