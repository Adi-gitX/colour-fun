// Complete Color Database - 238 Curated Colors
export interface Color {
  id: string;
  name: string;
  hex: string;
  category: ColorCategory;
}

export type ColorCategory = 
  | 'reds' 
  | 'oranges' 
  | 'yellows' 
  | 'greens' 
  | 'blues' 
  | 'purples' 
  | 'pinks' 
  | 'browns' 
  | 'grays' 
  | 'blacks' 
  | 'pastels' 
  | 'neons';

export const categoryLabels: Record<ColorCategory, string> = {
  reds: 'Reds',
  oranges: 'Oranges',
  yellows: 'Yellows',
  greens: 'Greens',
  blues: 'Blues',
  purples: 'Purples',
  pinks: 'Pinks',
  browns: 'Browns',
  grays: 'Grays',
  blacks: 'Black & White',
  pastels: 'Pastels',
  neons: 'Neons',
};

export const categoryColors: Record<ColorCategory, string> = {
  reds: '#E53935',
  oranges: '#FF9800',
  yellows: '#FDD835',
  greens: '#43A047',
  blues: '#1E88E5',
  purples: '#8E24AA',
  pinks: '#EC407A',
  browns: '#8D6E63',
  grays: '#78909C',
  blacks: '#37474F',
  pastels: 'linear-gradient(135deg, #FFE0E6, #E0F7FA, #FFF9C4)',
  neons: 'linear-gradient(135deg, #00FF87, #60EFFF, #FF00FF)',
};

export const colors: Color[] = [
  // REDS (22 colors)
  { id: 'red-1', name: 'Pure Red', hex: '#FF0000', category: 'reds' },
  { id: 'red-2', name: 'Crimson', hex: '#DC143C', category: 'reds' },
  { id: 'red-3', name: 'Scarlet', hex: '#FF2400', category: 'reds' },
  { id: 'red-4', name: 'Ruby', hex: '#E0115F', category: 'reds' },
  { id: 'red-5', name: 'Cherry', hex: '#DE3163', category: 'reds' },
  { id: 'red-6', name: 'Vermillion', hex: '#E34234', category: 'reds' },
  { id: 'red-7', name: 'Carmine', hex: '#960018', category: 'reds' },
  { id: 'red-8', name: 'Burgundy', hex: '#800020', category: 'reds' },
  { id: 'red-9', name: 'Maroon', hex: '#800000', category: 'reds' },
  { id: 'red-10', name: 'Wine', hex: '#722F37', category: 'reds' },
  { id: 'red-11', name: 'Blood Red', hex: '#8A0303', category: 'reds' },
  { id: 'red-12', name: 'Fire Brick', hex: '#B22222', category: 'reds' },
  { id: 'red-13', name: 'Indian Red', hex: '#CD5C5C', category: 'reds' },
  { id: 'red-14', name: 'Tomato', hex: '#FF6347', category: 'reds' },
  { id: 'red-15', name: 'Salmon', hex: '#FA8072', category: 'reds' },
  { id: 'red-16', name: 'Coral Red', hex: '#FF4040', category: 'reds' },
  { id: 'red-17', name: 'Rosewood', hex: '#65000B', category: 'reds' },
  { id: 'red-18', name: 'Raspberry', hex: '#E30B5C', category: 'reds' },
  { id: 'red-19', name: 'Cardinal', hex: '#C41E3A', category: 'reds' },
  { id: 'red-20', name: 'Candy Apple', hex: '#FF0800', category: 'reds' },
  { id: 'red-21', name: 'Ferrari Red', hex: '#FF2800', category: 'reds' },
  { id: 'red-22', name: 'Venetian Red', hex: '#C80815', category: 'reds' },

  // ORANGES (16 colors)
  { id: 'orange-1', name: 'Pure Orange', hex: '#FF8000', category: 'oranges' },
  { id: 'orange-2', name: 'Tangerine', hex: '#FF9966', category: 'oranges' },
  { id: 'orange-3', name: 'Peach', hex: '#FFCBA4', category: 'oranges' },
  { id: 'orange-4', name: 'Amber', hex: '#FFBF00', category: 'oranges' },
  { id: 'orange-5', name: 'Apricot', hex: '#FBCEB1', category: 'oranges' },
  { id: 'orange-6', name: 'Pumpkin', hex: '#FF7518', category: 'oranges' },
  { id: 'orange-7', name: 'Carrot', hex: '#ED9121', category: 'oranges' },
  { id: 'orange-8', name: 'Burnt Orange', hex: '#CC5500', category: 'oranges' },
  { id: 'orange-9', name: 'Rust', hex: '#B7410E', category: 'oranges' },
  { id: 'orange-10', name: 'Coral', hex: '#FF7F50', category: 'oranges' },
  { id: 'orange-11', name: 'Mango', hex: '#FF8243', category: 'oranges' },
  { id: 'orange-12', name: 'Papaya', hex: '#FF9700', category: 'oranges' },
  { id: 'orange-13', name: 'Persimmon', hex: '#EC5800', category: 'oranges' },
  { id: 'orange-14', name: 'Bronze', hex: '#CD7F32', category: 'oranges' },
  { id: 'orange-15', name: 'Sunset', hex: '#FAD6A5', category: 'oranges' },
  { id: 'orange-16', name: 'Copper', hex: '#B87333', category: 'oranges' },

  // YELLOWS (18 colors)
  { id: 'yellow-1', name: 'Pure Yellow', hex: '#FFFF00', category: 'yellows' },
  { id: 'yellow-2', name: 'Gold', hex: '#FFD700', category: 'yellows' },
  { id: 'yellow-3', name: 'Lemon', hex: '#FFF44F', category: 'yellows' },
  { id: 'yellow-4', name: 'Honey', hex: '#EB9605', category: 'yellows' },
  { id: 'yellow-5', name: 'Mustard', hex: '#FFDB58', category: 'yellows' },
  { id: 'yellow-6', name: 'Canary', hex: '#FFEF00', category: 'yellows' },
  { id: 'yellow-7', name: 'Sunflower', hex: '#FFDA03', category: 'yellows' },
  { id: 'yellow-8', name: 'Butter', hex: '#FFFAA0', category: 'yellows' },
  { id: 'yellow-9', name: 'Banana', hex: '#FFE135', category: 'yellows' },
  { id: 'yellow-10', name: 'Maize', hex: '#FBEC5D', category: 'yellows' },
  { id: 'yellow-11', name: 'Cream', hex: '#FFFDD0', category: 'yellows' },
  { id: 'yellow-12', name: 'Champagne', hex: '#F7E7CE', category: 'yellows' },
  { id: 'yellow-13', name: 'Flax', hex: '#EEDC82', category: 'yellows' },
  { id: 'yellow-14', name: 'Goldenrod', hex: '#DAA520', category: 'yellows' },
  { id: 'yellow-15', name: 'Saffron', hex: '#F4C430', category: 'yellows' },
  { id: 'yellow-16', name: 'Citrine', hex: '#E4D00A', category: 'yellows' },
  { id: 'yellow-17', name: 'Jasmine', hex: '#F8DE7E', category: 'yellows' },
  { id: 'yellow-18', name: 'Aureolin', hex: '#FDEE00', category: 'yellows' },

  // GREENS (28 colors)
  { id: 'green-1', name: 'Pure Green', hex: '#00FF00', category: 'greens' },
  { id: 'green-2', name: 'Emerald', hex: '#50C878', category: 'greens' },
  { id: 'green-3', name: 'Forest', hex: '#228B22', category: 'greens' },
  { id: 'green-4', name: 'Mint', hex: '#98FF98', category: 'greens' },
  { id: 'green-5', name: 'Sage', hex: '#9DC183', category: 'greens' },
  { id: 'green-6', name: 'Olive', hex: '#808000', category: 'greens' },
  { id: 'green-7', name: 'Lime', hex: '#32CD32', category: 'greens' },
  { id: 'green-8', name: 'Jade', hex: '#00A86B', category: 'greens' },
  { id: 'green-9', name: 'Sea Green', hex: '#2E8B57', category: 'greens' },
  { id: 'green-10', name: 'Shamrock', hex: '#45CEA2', category: 'greens' },
  { id: 'green-11', name: 'Chartreuse', hex: '#7FFF00', category: 'greens' },
  { id: 'green-12', name: 'Kelly Green', hex: '#4CBB17', category: 'greens' },
  { id: 'green-13', name: 'Hunter Green', hex: '#355E3B', category: 'greens' },
  { id: 'green-14', name: 'Fern', hex: '#4F7942', category: 'greens' },
  { id: 'green-15', name: 'Moss', hex: '#8A9A5B', category: 'greens' },
  { id: 'green-16', name: 'Pine', hex: '#01796F', category: 'greens' },
  { id: 'green-17', name: 'Jungle', hex: '#29AB87', category: 'greens' },
  { id: 'green-18', name: 'Spring Green', hex: '#00FF7F', category: 'greens' },
  { id: 'green-19', name: 'Malachite', hex: '#0BDA51', category: 'greens' },
  { id: 'green-20', name: 'Viridian', hex: '#40826D', category: 'greens' },
  { id: 'green-21', name: 'Asparagus', hex: '#87A96B', category: 'greens' },
  { id: 'green-22', name: 'Celadon', hex: '#ACE1AF', category: 'greens' },
  { id: 'green-23', name: 'Pistachio', hex: '#93C572', category: 'greens' },
  { id: 'green-24', name: 'Basil', hex: '#579229', category: 'greens' },
  { id: 'green-25', name: 'Avocado', hex: '#568203', category: 'greens' },
  { id: 'green-26', name: 'Pickle', hex: '#6B8E23', category: 'greens' },
  { id: 'green-27', name: 'Seaweed', hex: '#1B4D3E', category: 'greens' },
  { id: 'green-28', name: 'Eucalyptus', hex: '#44D7A8', category: 'greens' },

  // BLUES (32 colors)
  { id: 'blue-1', name: 'Pure Blue', hex: '#0000FF', category: 'blues' },
  { id: 'blue-2', name: 'Navy', hex: '#000080', category: 'blues' },
  { id: 'blue-3', name: 'Sky Blue', hex: '#87CEEB', category: 'blues' },
  { id: 'blue-4', name: 'Cobalt', hex: '#0047AB', category: 'blues' },
  { id: 'blue-5', name: 'Azure', hex: '#007FFF', category: 'blues' },
  { id: 'blue-6', name: 'Teal', hex: '#008080', category: 'blues' },
  { id: 'blue-7', name: 'Cyan', hex: '#00FFFF', category: 'blues' },
  { id: 'blue-8', name: 'Cerulean', hex: '#007BA7', category: 'blues' },
  { id: 'blue-9', name: 'Sapphire', hex: '#0F52BA', category: 'blues' },
  { id: 'blue-10', name: 'Royal Blue', hex: '#4169E1', category: 'blues' },
  { id: 'blue-11', name: 'Midnight Blue', hex: '#191970', category: 'blues' },
  { id: 'blue-12', name: 'Electric Blue', hex: '#7DF9FF', category: 'blues' },
  { id: 'blue-13', name: 'Ocean', hex: '#4F42B5', category: 'blues' },
  { id: 'blue-14', name: 'Steel Blue', hex: '#4682B4', category: 'blues' },
  { id: 'blue-15', name: 'Powder Blue', hex: '#B0E0E6', category: 'blues' },
  { id: 'blue-16', name: 'Turquoise', hex: '#40E0D0', category: 'blues' },
  { id: 'blue-17', name: 'Aquamarine', hex: '#7FFFD4', category: 'blues' },
  { id: 'blue-18', name: 'Denim', hex: '#1560BD', category: 'blues' },
  { id: 'blue-19', name: 'Cornflower', hex: '#6495ED', category: 'blues' },
  { id: 'blue-20', name: 'Indigo', hex: '#4B0082', category: 'blues' },
  { id: 'blue-21', name: 'Prussian', hex: '#003153', category: 'blues' },
  { id: 'blue-22', name: 'Periwinkle', hex: '#CCCCFF', category: 'blues' },
  { id: 'blue-23', name: 'Aegean', hex: '#1F456E', category: 'blues' },
  { id: 'blue-24', name: 'Arctic', hex: '#82EEFD', category: 'blues' },
  { id: 'blue-25', name: 'Baby Blue', hex: '#89CFF0', category: 'blues' },
  { id: 'blue-26', name: 'Bluebell', hex: '#A2A2D0', category: 'blues' },
  { id: 'blue-27', name: 'Capri', hex: '#00BFFF', category: 'blues' },
  { id: 'blue-28', name: 'Carolina', hex: '#56A0D3', category: 'blues' },
  { id: 'blue-29', name: 'Glacier', hex: '#80B3C4', category: 'blues' },
  { id: 'blue-30', name: 'Ice Blue', hex: '#99FFFF', category: 'blues' },
  { id: 'blue-31', name: 'Maya Blue', hex: '#73C2FB', category: 'blues' },
  { id: 'blue-32', name: 'Peacock', hex: '#005F69', category: 'blues' },

  // PURPLES (22 colors)
  { id: 'purple-1', name: 'Pure Purple', hex: '#800080', category: 'purples' },
  { id: 'purple-2', name: 'Violet', hex: '#EE82EE', category: 'purples' },
  { id: 'purple-3', name: 'Lavender', hex: '#E6E6FA', category: 'purples' },
  { id: 'purple-4', name: 'Plum', hex: '#DDA0DD', category: 'purples' },
  { id: 'purple-5', name: 'Orchid', hex: '#DA70D6', category: 'purples' },
  { id: 'purple-6', name: 'Mauve', hex: '#E0B0FF', category: 'purples' },
  { id: 'purple-7', name: 'Amethyst', hex: '#9966CC', category: 'purples' },
  { id: 'purple-8', name: 'Grape', hex: '#6F2DA8', category: 'purples' },
  { id: 'purple-9', name: 'Eggplant', hex: '#614051', category: 'purples' },
  { id: 'purple-10', name: 'Mulberry', hex: '#C54B8C', category: 'purples' },
  { id: 'purple-11', name: 'Byzantium', hex: '#702963', category: 'purples' },
  { id: 'purple-12', name: 'Heliotrope', hex: '#DF73FF', category: 'purples' },
  { id: 'purple-13', name: 'Iris', hex: '#5A4FCF', category: 'purples' },
  { id: 'purple-14', name: 'Wisteria', hex: '#C9A0DC', category: 'purples' },
  { id: 'purple-15', name: 'Lilac', hex: '#C8A2C8', category: 'purples' },
  { id: 'purple-16', name: 'Thistle', hex: '#D8BFD8', category: 'purples' },
  { id: 'purple-17', name: 'Tyrian', hex: '#66023C', category: 'purples' },
  { id: 'purple-18', name: 'Palatinate', hex: '#682860', category: 'purples' },
  { id: 'purple-19', name: 'Puce', hex: '#CC8899', category: 'purples' },
  { id: 'purple-20', name: 'Royal Purple', hex: '#7851A9', category: 'purples' },
  { id: 'purple-21', name: 'Ultra Violet', hex: '#645394', category: 'purples' },
  { id: 'purple-22', name: 'Veronica', hex: '#A020F0', category: 'purples' },

  // PINKS (20 colors)
  { id: 'pink-1', name: 'Pure Pink', hex: '#FFC0CB', category: 'pinks' },
  { id: 'pink-2', name: 'Rose', hex: '#FF007F', category: 'pinks' },
  { id: 'pink-3', name: 'Blush', hex: '#DE5D83', category: 'pinks' },
  { id: 'pink-4', name: 'Fuchsia', hex: '#FF00FF', category: 'pinks' },
  { id: 'pink-5', name: 'Magenta', hex: '#FF0090', category: 'pinks' },
  { id: 'pink-6', name: 'Hot Pink', hex: '#FF69B4', category: 'pinks' },
  { id: 'pink-7', name: 'Salmon Pink', hex: '#FF91A4', category: 'pinks' },
  { id: 'pink-8', name: 'Bubblegum', hex: '#FFC1CC', category: 'pinks' },
  { id: 'pink-9', name: 'Carnation', hex: '#FFA6C9', category: 'pinks' },
  { id: 'pink-10', name: 'Cerise', hex: '#DE3163', category: 'pinks' },
  { id: 'pink-11', name: 'Cherry Blossom', hex: '#FFB7C5', category: 'pinks' },
  { id: 'pink-12', name: 'Flamingo', hex: '#FC8EAC', category: 'pinks' },
  { id: 'pink-13', name: 'Punch', hex: '#EC5578', category: 'pinks' },
  { id: 'pink-14', name: 'Coral Pink', hex: '#F88379', category: 'pinks' },
  { id: 'pink-15', name: 'Peony', hex: '#E6797D', category: 'pinks' },
  { id: 'pink-16', name: 'Thulian', hex: '#DE6FA1', category: 'pinks' },
  { id: 'pink-17', name: 'Watermelon', hex: '#FD4659', category: 'pinks' },
  { id: 'pink-18', name: 'Deep Pink', hex: '#FF1493', category: 'pinks' },
  { id: 'pink-19', name: 'Persian Pink', hex: '#F77FBE', category: 'pinks' },
  { id: 'pink-20', name: 'Amaranth', hex: '#E52B50', category: 'pinks' },

  // BROWNS (16 colors)
  { id: 'brown-1', name: 'Brown', hex: '#A52A2A', category: 'browns' },
  { id: 'brown-2', name: 'Chocolate', hex: '#7B3F00', category: 'browns' },
  { id: 'brown-3', name: 'Tan', hex: '#D2B48C', category: 'browns' },
  { id: 'brown-4', name: 'Mocha', hex: '#967969', category: 'browns' },
  { id: 'brown-5', name: 'Caramel', hex: '#FFD59A', category: 'browns' },
  { id: 'brown-6', name: 'Coffee', hex: '#6F4E37', category: 'browns' },
  { id: 'brown-7', name: 'Chestnut', hex: '#954535', category: 'browns' },
  { id: 'brown-8', name: 'Sienna', hex: '#A0522D', category: 'browns' },
  { id: 'brown-9', name: 'Espresso', hex: '#3C2415', category: 'browns' },
  { id: 'brown-10', name: 'Umber', hex: '#635147', category: 'browns' },
  { id: 'brown-11', name: 'Khaki', hex: '#C3B091', category: 'browns' },
  { id: 'brown-12', name: 'Beige', hex: '#F5F5DC', category: 'browns' },
  { id: 'brown-13', name: 'Sepia', hex: '#704214', category: 'browns' },
  { id: 'brown-14', name: 'Walnut', hex: '#773F1A', category: 'browns' },
  { id: 'brown-15', name: 'Mahogany', hex: '#C04000', category: 'browns' },
  { id: 'brown-16', name: 'Cinnamon', hex: '#D2691E', category: 'browns' },

  // GRAYS (18 colors)
  { id: 'gray-1', name: 'Gray', hex: '#808080', category: 'grays' },
  { id: 'gray-2', name: 'Slate', hex: '#708090', category: 'grays' },
  { id: 'gray-3', name: 'Charcoal', hex: '#36454F', category: 'grays' },
  { id: 'gray-4', name: 'Silver', hex: '#C0C0C0', category: 'grays' },
  { id: 'gray-5', name: 'Ash', hex: '#B2BEB5', category: 'grays' },
  { id: 'gray-6', name: 'Smoke', hex: '#738276', category: 'grays' },
  { id: 'gray-7', name: 'Gunmetal', hex: '#2A3439', category: 'grays' },
  { id: 'gray-8', name: 'Graphite', hex: '#53565A', category: 'grays' },
  { id: 'gray-9', name: 'Pewter', hex: '#8BA8B7', category: 'grays' },
  { id: 'gray-10', name: 'Steel', hex: '#71797E', category: 'grays' },
  { id: 'gray-11', name: 'Platinum', hex: '#E5E4E2', category: 'grays' },
  { id: 'gray-12', name: 'Nickel', hex: '#727472', category: 'grays' },
  { id: 'gray-13', name: 'Iron', hex: '#48494B', category: 'grays' },
  { id: 'gray-14', name: 'Battleship', hex: '#848482', category: 'grays' },
  { id: 'gray-15', name: 'Cool Gray', hex: '#8C92AC', category: 'grays' },
  { id: 'gray-16', name: 'Warm Gray', hex: '#9E9E93', category: 'grays' },
  { id: 'gray-17', name: 'Taupe', hex: '#483C32', category: 'grays' },
  { id: 'gray-18', name: 'Marengo', hex: '#4C5866', category: 'grays' },

  // BLACK & WHITE (12 colors)
  { id: 'black-1', name: 'Pure Black', hex: '#000000', category: 'blacks' },
  { id: 'black-2', name: 'Jet Black', hex: '#0A0A0A', category: 'blacks' },
  { id: 'black-3', name: 'Onyx', hex: '#353839', category: 'blacks' },
  { id: 'black-4', name: 'Ebony', hex: '#555D50', category: 'blacks' },
  { id: 'black-5', name: 'Obsidian', hex: '#1B1B1B', category: 'blacks' },
  { id: 'black-6', name: 'Raven', hex: '#0D0D0D', category: 'blacks' },
  { id: 'black-7', name: 'Pure White', hex: '#FFFFFF', category: 'blacks' },
  { id: 'black-8', name: 'Ivory', hex: '#FFFFF0', category: 'blacks' },
  { id: 'black-9', name: 'Snow', hex: '#FFFAFA', category: 'blacks' },
  { id: 'black-10', name: 'Ghost White', hex: '#F8F8FF', category: 'blacks' },
  { id: 'black-11', name: 'Eggshell', hex: '#F0EAD6', category: 'blacks' },
  { id: 'black-12', name: 'Pearl', hex: '#FDEEF4', category: 'blacks' },

  // PASTELS (20 colors)
  { id: 'pastel-1', name: 'Pastel Pink', hex: '#FFD1DC', category: 'pastels' },
  { id: 'pastel-2', name: 'Pastel Blue', hex: '#AEC6CF', category: 'pastels' },
  { id: 'pastel-3', name: 'Pastel Green', hex: '#77DD77', category: 'pastels' },
  { id: 'pastel-4', name: 'Pastel Yellow', hex: '#FDFD96', category: 'pastels' },
  { id: 'pastel-5', name: 'Pastel Purple', hex: '#B39EB5', category: 'pastels' },
  { id: 'pastel-6', name: 'Pastel Orange', hex: '#FFB347', category: 'pastels' },
  { id: 'pastel-7', name: 'Mint Cream', hex: '#F5FFFA', category: 'pastels' },
  { id: 'pastel-8', name: 'Lavender Blush', hex: '#FFF0F5', category: 'pastels' },
  { id: 'pastel-9', name: 'Alice Blue', hex: '#F0F8FF', category: 'pastels' },
  { id: 'pastel-10', name: 'Seashell', hex: '#FFF5EE', category: 'pastels' },
  { id: 'pastel-11', name: 'Honeydew', hex: '#F0FFF0', category: 'pastels' },
  { id: 'pastel-12', name: 'Linen', hex: '#FAF0E6', category: 'pastels' },
  { id: 'pastel-13', name: 'Old Lace', hex: '#FDF5E6', category: 'pastels' },
  { id: 'pastel-14', name: 'Misty Rose', hex: '#FFE4E1', category: 'pastels' },
  { id: 'pastel-15', name: 'Papaya Whip', hex: '#FFEFD5', category: 'pastels' },
  { id: 'pastel-16', name: 'Pale Turquoise', hex: '#AFEEEE', category: 'pastels' },
  { id: 'pastel-17', name: 'Light Coral', hex: '#F08080', category: 'pastels' },
  { id: 'pastel-18', name: 'Cotton Candy', hex: '#FFBCD9', category: 'pastels' },
  { id: 'pastel-19', name: 'Baby Powder', hex: '#FEFEFA', category: 'pastels' },
  { id: 'pastel-20', name: 'Rose Quartz', hex: '#F7CAC9', category: 'pastels' },

  // NEONS (14 colors)
  { id: 'neon-1', name: 'Neon Pink', hex: '#FF6EC7', category: 'neons' },
  { id: 'neon-2', name: 'Neon Green', hex: '#39FF14', category: 'neons' },
  { id: 'neon-3', name: 'Neon Blue', hex: '#4D4DFF', category: 'neons' },
  { id: 'neon-4', name: 'Neon Yellow', hex: '#FFFF00', category: 'neons' },
  { id: 'neon-5', name: 'Neon Orange', hex: '#FF5F1F', category: 'neons' },
  { id: 'neon-6', name: 'Neon Purple', hex: '#BC13FE', category: 'neons' },
  { id: 'neon-7', name: 'Electric Lime', hex: '#CCFF00', category: 'neons' },
  { id: 'neon-8', name: 'Electric Cyan', hex: '#00FFFF', category: 'neons' },
  { id: 'neon-9', name: 'Hot Magenta', hex: '#FF1DCE', category: 'neons' },
  { id: 'neon-10', name: 'Laser Lemon', hex: '#FFFF66', category: 'neons' },
  { id: 'neon-11', name: 'Fluorescent Red', hex: '#FF5555', category: 'neons' },
  { id: 'neon-12', name: 'Screamin Green', hex: '#66FF66', category: 'neons' },
  { id: 'neon-13', name: 'Shocking Pink', hex: '#FC0FC0', category: 'neons' },
  { id: 'neon-14', name: 'Ultra Pink', hex: '#FF6FFF', category: 'neons' },
];

// Export color count
export const colorCount = colors.length;

// Get colors by category
export const getColorsByCategory = (category: ColorCategory | 'all'): Color[] => {
  if (category === 'all') return colors;
  return colors.filter(c => c.category === category);
};

// Search colors
export const searchColors = (query: string): Color[] => {
  const q = query.toLowerCase().trim();
  if (!q) return colors;
  
  return colors.filter(c => 
    c.name.toLowerCase().includes(q) || 
    c.hex.toLowerCase().includes(q) ||
    c.category.toLowerCase().includes(q)
  );
};
