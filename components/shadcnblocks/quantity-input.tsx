import React from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface QuantityInputProps {
  inputProps: any;
  onValueChange: (value: number) => void;
  className?: string;
  min?: number;
  max?: number;
}

const QuantityInput = ({
  inputProps,
  onValueChange,
  className,
  min = 1,
  max = 99,
}: QuantityInputProps) => {
  const currentValue = inputProps.value || 1;

  const handleIncrement = () => {
    const newValue = Math.min(currentValue + 1, max);
    onValueChange(newValue);
  };

  const handleDecrement = () => {
    const newValue = Math.max(currentValue - 1, min);
    onValueChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      const clampedValue = Math.min(Math.max(value, min), max);
      onValueChange(clampedValue);
    }
  };

  return (
    <div className={cn("flex items-center border rounded-lg", className)}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-9 w-9 p-0"
        onClick={handleDecrement}
        disabled={currentValue <= min}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Input
        {...inputProps}
        type="number"
        min={min}
        max={max}
        value={currentValue}
        onChange={handleInputChange}
        className="h-9 w-12 border-0 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-9 w-9 p-0"
        onClick={handleIncrement}
        disabled={currentValue >= max}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default QuantityInput;
