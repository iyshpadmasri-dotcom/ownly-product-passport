import React from 'react';
import {
  Smartphone,
  Laptop,
  Watch,
  Tv,
  Coffee,
  Car,
  Bike,
  Armchair,
  Shirt,
  BookOpen,
  Gamepad2,
  Box
} from 'lucide-react';

export const CATEGORIES = [
  { id: 'Smartphones & Accessories', label: 'Smartphones & Accessories', icon: Smartphone, desc: 'Phones, chargers, earphones' },
  { id: 'Laptops & Computers', label: 'Laptops & Computers', icon: Laptop, desc: 'MacBooks, PC laptops, monitors' },
  { id: 'Tablets & Smartwatches', label: 'Tablets & Smartwatches', icon: Watch, desc: 'iPads, Android tablets, fitness bands' },
  { id: 'Televisions & Home Electronics', label: 'Televisions & Home Audio', icon: Tv, desc: 'Smart TVs, speakers, soundbars' },
  { id: 'Washing Machines & Appliances', label: 'Home Appliances', icon: Coffee, desc: 'Washing machines, fridges, air fryers' },
  { id: 'Cars & Motorcycles', label: 'Cars & Motorcycles', icon: Car, desc: 'Two-wheelers, cars, bike gear' },
  { id: 'Bicycles & Electric Scooters', label: 'Bicycles & EV Scooters', icon: Bike, desc: 'Cycles, e-scooters, helmets' },
  { id: 'Furniture & Home Products', label: 'Furniture & Home', icon: Armchair, desc: 'Desks, ergonomic chairs, decor' },
  { id: 'Clothing & Footwear', label: 'Clothing & Footwear', icon: Shirt, desc: 'Jackets, sneakers, ethnic wear' },
  { id: 'Books & Educational Materials', label: 'Books & Learning', icon: BookOpen, desc: 'Textbooks, non-fiction, novels' },
  { id: 'Toys & Gaming', label: 'Gaming & Toys', icon: Gamepad2, desc: 'Consoles, controllers, board games' },
  { id: 'Other Physical Products', label: 'Other Products', icon: Box, desc: 'Tools, sports items, hobbies' },
];

const CategorySelector = ({ selectedCategory, onSelect }) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
      gap: '12px',
    }}>
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        const isSelected = selectedCategory === cat.id;

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            style={{
              padding: '14px 10px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: isSelected ? 'var(--color-accent-lavender-light)' : '#FFFFFF',
              border: `2px solid ${isSelected ? 'var(--color-accent-lavender)' : 'var(--color-border)'}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              boxShadow: isSelected ? '0 4px 14px rgba(169, 154, 232, 0.25)' : 'none',
              transform: isSelected ? 'translateY(-2px)' : 'none',
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: isSelected ? 'var(--color-accent-lavender)' : '#F5F2EB',
              color: isSelected ? '#FFFFFF' : 'var(--color-text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '8px',
              transition: 'all var(--transition-fast)',
            }}>
              <Icon size={20} />
            </div>

            <span style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              color: isSelected ? '#4F40A5' : 'var(--color-text-primary)',
              lineHeight: 1.25,
            }}>
              {cat.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default CategorySelector;
