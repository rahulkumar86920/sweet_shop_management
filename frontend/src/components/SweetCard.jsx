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
    <div className="card border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">{sweet.name}</h3>
          <p className="text-gray-600 mt-1">{sweet.description}</p>
          <div className="flex items-center gap-4 mt-2">
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
              {sweet.category}
            </span>
            <span className="text-lg font-bold text-primary-600">
              ${sweet.price.toFixed(2)}
            </span>
          </div>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <button
              onClick={() => onUpdate(sweet)}
              className="text-blue-600 hover:text-blue-800"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(sweet._id)}
              className="text-red-600 hover:text-red-800"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">In Stock</p>
            <p className={`text-lg font-semibold ${sweet.quantity === 0 ? 'text-red-600' : 'text-green-600'}`}>
              {sweet.quantity} units
            </p>
            <p className="text-sm text-gray-500">Sold: {sweet.soldCount}</p>
          </div>

          <div className="flex flex-col gap-2">
            {!isAdmin ? (
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  max={sweet.quantity}
                  value={purchaseQuantity}
                  onChange={(e) => setPurchaseQuantity(parseInt(e.target.value) || 1)}
                  className="w-20 px-2 py-1 border rounded text-center"
                  disabled={sweet.quantity === 0}
                />
                <button
                  onClick={handlePurchase}
                  disabled={sweet.quantity === 0 || isPurchasing}
                  className="btn-primary px-4 py-2 text-sm"
                >
                  {isPurchasing ? 'Purchasing...' : 'Purchase'}
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  value={restockQuantity}
                  onChange={(e) => setRestockQuantity(parseInt(e.target.value) || 10)}
                  className="w-20 px-2 py-1 border rounded text-center"
                />
                <button
                  onClick={handleRestock}
                  disabled={isRestocking}
                  className="btn-primary px-4 py-2 text-sm bg-green-600 hover:bg-green-700"
                >
                  {isRestocking ? 'Restocking...' : 'Restock'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SweetCard;