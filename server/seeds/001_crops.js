exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('crops').del();
  
  // Inserts seed entries
  return knex('crops').insert([
    // Basic Crops
    {
      name: 'Sunflower',
      type: 'crop',
      grow_time: 60,
      harvest_time: 60,
      sell_price: 0.02,
      image_url: 'https://sunflower-land.com/images/crops/sunflower.png',
      description: 'Cây hướng dương cơ bản, dễ trồng và thu hoạch nhanh'
    },
    {
      name: 'Potato',
      type: 'crop',
      grow_time: 300,
      harvest_time: 300,
      sell_price: 0.14,
      image_url: 'https://sunflower-land.com/images/crops/potato.png',
      description: 'Khoai tây, thời gian phát triển trung bình'
    },
    {
      name: 'Pumpkin',
      type: 'crop',
      grow_time: 1800,
      harvest_time: 1800,
      sell_price: 0.8,
      image_url: 'https://sunflower-land.com/images/crops/pumpkin.png',
      description: 'Bí ngô, cần thời gian phát triển lâu nhưng giá trị cao'
    },
    {
      name: 'Carrot',
      type: 'crop',
      grow_time: 60,
      harvest_time: 60,
      sell_price: 0.02,
      image_url: 'https://sunflower-land.com/images/crops/carrot.png',
      description: 'Cà rốt, cây trồng cơ bản'
    },
    {
      name: 'Cabbage',
      type: 'crop',
      grow_time: 900,
      harvest_time: 900,
      sell_price: 0.4,
      image_url: 'https://sunflower-land.com/images/crops/cabbage.png',
      description: 'Bắp cải, thời gian phát triển dài'
    },
    {
      name: 'Beetroot',
      type: 'crop',
      grow_time: 300,
      harvest_time: 300,
      sell_price: 0.14,
      image_url: 'https://sunflower-land.com/images/crops/beetroot.png',
      description: 'Củ cải đỏ, cây trồng trung bình'
    },
    {
      name: 'Cauliflower',
      type: 'crop',
      grow_time: 1800,
      harvest_time: 1800,
      sell_price: 0.8,
      image_url: 'https://sunflower-land.com/images/crops/cauliflower.png',
      description: 'Súp lơ, cần thời gian phát triển lâu'
    },
    {
      name: 'Parsnip',
      type: 'crop',
      grow_time: 900,
      harvest_time: 900,
      sell_price: 0.4,
      image_url: 'https://sunflower-land.com/images/crops/parsnip.png',
      description: 'Củ cải vàng, thời gian phát triển dài'
    },
    {
      name: 'Eggplant',
      type: 'crop',
      grow_time: 1800,
      harvest_time: 1800,
      sell_price: 0.8,
      image_url: 'https://sunflower-land.com/images/crops/eggplant.png',
      description: 'Cà tím, cần thời gian phát triển lâu'
    },
    {
      name: 'Corn',
      type: 'crop',
      grow_time: 900,
      harvest_time: 900,
      sell_price: 0.4,
      image_url: 'https://sunflower-land.com/images/crops/corn.png',
      description: 'Ngô, thời gian phát triển dài'
    },
    {
      name: 'Radish',
      type: 'crop',
      grow_time: 60,
      harvest_time: 60,
      sell_price: 0.02,
      image_url: 'https://sunflower-land.com/images/crops/radish.png',
      description: 'Củ cải, cây trồng cơ bản'
    },
    {
      name: 'Wheat',
      type: 'crop',
      grow_time: 300,
      harvest_time: 300,
      sell_price: 0.14,
      image_url: 'https://sunflower-land.com/images/crops/wheat.png',
      description: 'Lúa mì, cây trồng trung bình'
    },
    {
      name: 'Kale',
      type: 'crop',
      grow_time: 1800,
      harvest_time: 1800,
      sell_price: 0.8,
      image_url: 'https://sunflower-land.com/images/crops/kale.png',
      description: 'Cải xoăn, cần thời gian phát triển lâu'
    },

    // Trees
    {
      name: 'Apple Tree',
      type: 'tree',
      grow_time: 3600,
      harvest_time: 3600,
      sell_price: 1.5,
      image_url: 'https://sunflower-land.com/images/trees/apple.png',
      description: 'Cây táo, cần thời gian phát triển rất lâu nhưng giá trị cao'
    },
    {
      name: 'Orange Tree',
      type: 'tree',
      grow_time: 3600,
      harvest_time: 3600,
      sell_price: 1.5,
      image_url: 'https://sunflower-land.com/images/trees/orange.png',
      description: 'Cây cam, cần thời gian phát triển rất lâu'
    },
    {
      name: 'Blueberry Bush',
      type: 'bush',
      grow_time: 1800,
      harvest_time: 1800,
      sell_price: 0.8,
      image_url: 'https://sunflower-land.com/images/bushes/blueberry.png',
      description: 'Bụi việt quất, thời gian phát triển dài'
    },
    {
      name: 'Banana Plant',
      type: 'tree',
      grow_time: 3600,
      harvest_time: 3600,
      sell_price: 1.5,
      image_url: 'https://sunflower-land.com/images/trees/banana.png',
      description: 'Cây chuối, cần thời gian phát triển rất lâu'
    }
  ]);
};
