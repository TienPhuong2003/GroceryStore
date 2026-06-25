import React from "react";
import type { Address } from "../types";
import { CheckIcon, MapPinIcon, PencilIcon, Trash2Icon } from "lucide-react";

interface AddressCardProps {
  addr: Address;
  onEditHandler: (addr: Address) => void;
  setAddresses: (addresses: Address[]) => void;
}

const AddressCard = ({
  addr,
  onEditHandler,
  setAddresses,
}: AddressCardProps) => {
  const handleDelete = async (id: string) => {
    console.log(id);
  };

  return (
    <div
      key={addr._id}
      className="max-w-3xl bg-white rounded-2xl p-6 flex items-start justify-between"
    >
      <div className="flex gap-4">
        <div className="size-10 rounded-xl bg-app-cream flex-center shrink-0">
          <MapPinIcon className="size-5 text-app-green" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2 mb-2">
            <h3 className="text-base font-semibold text-app-green">
              {addr.label}
            </h3>

            {addr.isDefault && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                <CheckIcon className="size-3" />
                Default
              </span>
            )}
          </div>

          <p className="text-sm text-app-text-light leading-relaxed">
            {addr.address}
          </p>

          <p className="text-sm text-app-text-light mt-1">
            {addr.city}, {addr.state} {addr.zip}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onEditHandler(addr)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-app-green hover:bg-app-cream rounded-xl transition-colors"
        >
          <PencilIcon className="size-4" />
          Edit
        </button>

        <button
          onClick={() => handleDelete(addr._id)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-app-error hover:bg-red-50 rounded-xl transition-colors"
        >
          <Trash2Icon className="size-4" />
          Delete
        </button>
      </div>
    </div>
  );
};

export default AddressCard;
