import type { Product } from '../api/products'

const taperedModels = [
  '30202', '30203', '30204', '30205', '30206', '30207', '30208', '30209', '30210',
  '30211', '30212', '30213', '30214', '30215', '30216', '30217', '30218', '30219', '30220',
  '30302', '30303', '30304', '30305', '30306', '30307', '30308', '30309', '30310',
  '31305', '31306', '31307', '31308', '31309', '31310',
  '32004', '32005', '32006', '32007', '32008', '32009', '32010',
  '32011', '32012', '32013', '32014', '32015', '32016', '32017', '32018', '32019', '32020'
]

const cylindricalModels = [
  'NJ204', 'NJ205', 'NJ206', 'NJ207', 'NJ208', 'NJ209', 'NJ210',
  'NJ211', 'NJ212', 'NJ213', 'NJ214', 'NJ215', 'NJ216', 'NJ217', 'NJ218', 'NJ219', 'NJ220',
  'NUP204', 'NUP205', 'NUP206', 'NUP207', 'NUP208', 'NUP209', 'NUP210',
  'NUP211', 'NUP212', 'NUP213', 'NUP214', 'NUP215', 'NUP216', 'NUP217', 'NUP218', 'NUP219', 'NUP220',
  'NJ2306', 'NJ2307', 'NJ2308', 'NJ2309', 'NJ2310', 'NJ2311', 'NJ2312', 'NJ2313', 'NJ2314', 'NJ2315'
]

const angularContactModels = [
  '7200C', '7201C', '7202C', '7203C', '7204C', '7205C', '7206C', '7207C', '7208C', '7209C',
  '7210C', '7211C', '7212C', '7213C', '7214C', '7215C', '7216C', '7217C', '7218C', '7219C', '7220C',
  '7300C', '7301C', '7302C', '7303C', '7304C', '7305C', '7306C', '7307C', '7308C', '7309C', '7310C'
]

const brands = ['SKF', 'NSK', 'FAG', 'NTN', 'INA', 'TIMKEN', 'KOYO', 'NACHI']
const precisionGrades = ['P0', 'P6', 'P5', 'P4', 'P2']
const materials = ['GCr15', '不锈钢', '陶瓷']

interface SizeSpec {
  d: number
  D: number
  B: number
}

const deepGrooveSizes: SizeSpec[] = [
  { d: 10, D: 26, B: 8 }, { d: 12, D: 28, B: 8 }, { d: 15, D: 32, B: 9 },
  { d: 17, D: 35, B: 10 }, { d: 20, D: 42, B: 12 }, { d: 25, D: 47, B: 12 },
  { d: 30, D: 55, B: 13 }, { d: 35, D: 62, B: 14 }, { d: 40, D: 68, B: 15 },
  { d: 45, D: 75, B: 16 }, { d: 50, D: 80, B: 16 }, { d: 55, D: 90, B: 18 },
  { d: 60, D: 95, B: 18 }, { d: 65, D: 100, B: 18 }, { d: 70, D: 110, B: 20 },
  { d: 75, D: 115, B: 20 }, { d: 80, D: 125, B: 22 }, { d: 85, D: 130, B: 22 },
  { d: 90, D: 140, B: 24 }, { d: 95, D: 145, B: 24 }, { d: 100, D: 150, B: 24 }
]

function randomElement<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateId(): string {
  return 'P' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase()
}

function generateProducts(): Product[] {
  const products: Product[] = []
  let id = 1

  for (const size of deepGrooveSizes) {
    for (const brand of brands) {
      const modelNum = size.d === 10 ? '6000' : size.d === 12 ? '6001' : 
                       size.d === 15 ? '6002' : size.d === 17 ? '6003' :
                       size.d === 20 ? '6004' : size.d === 25 ? '6005' :
                       size.d === 30 ? '6006' : size.d === 35 ? '6007' :
                       size.d === 40 ? '6008' : size.d === 45 ? '6009' :
                       size.d === 50 ? '6010' : size.d === 55 ? '6011' :
                       size.d === 60 ? '6012' : size.d === 65 ? '6013' :
                       size.d === 70 ? '6014' : size.d === 75 ? '6015' :
                       size.d === 80 ? '6016' : size.d === 85 ? '6017' :
                       size.d === 90 ? '6018' : size.d === 95 ? '6019' : '6020'
      
      for (const sealType of ['开放式', 'RS', '2RS']) {
        products.push({
          id: generateId(),
          model: `${modelNum}-${sealType}`,
          brand,
          type: '深沟球轴承',
          category: '滚动轴承',
          innerDiameter: size.d,
          outerDiameter: size.D,
          width: size.B,
          loadRatingDynamic: randomInt(10, 50),
          loadRatingStatic: randomInt(5, 30),
          speedLimit: randomInt(5000, 20000),
          precision: randomElement(precisionGrades),
          sealType,
          material: randomElement(materials),
          price: brand === 'SKF' || brand === 'TIMKEN' ? randomInt(50, 200) : randomInt(20, 80),
          stock: randomInt(0, 500),
          description: `${brand} ${modelNum}-${sealType} 深沟球轴承，内径${size.d}mm，外径${size.D}mm`,
          imageUrl: '/bearing.svg',
          datasheetUrl: ''
        })
        id++
        if (id > 60) break
      }
      if (id > 60) break
    }
    if (id > 60) break
  }

  for (let i = 0; i < 20; i++) {
    const model = randomElement(taperedModels)
    const d = parseInt(model.slice(2, 4)) * 5
    const D = d + randomInt(10, 30)
    const B = randomInt(8, 25)
    const brand = randomElement(brands)
    
    products.push({
      id: generateId(),
      model,
      brand,
      type: '圆锥滚子轴承',
      category: '滚动轴承',
      innerDiameter: d,
      outerDiameter: D,
      width: B,
      loadRatingDynamic: randomInt(30, 100),
      loadRatingStatic: randomInt(20, 60),
      speedLimit: randomInt(3000, 10000),
      precision: randomElement(precisionGrades),
      sealType: '开放式',
      material: randomElement(materials),
      price: brand === 'SKF' || brand === 'TIMKEN' ? randomInt(80, 300) : randomInt(40, 120),
      stock: randomInt(0, 300),
      description: `${brand} ${model} 圆锥滚子轴承，内径${d}mm，外径${D}mm`,
      imageUrl: '/bearing.svg',
      datasheetUrl: ''
    })
  }

  for (let i = 0; i < 15; i++) {
    const model = randomElement(cylindricalModels)
    const d = parseInt(model.slice(2, 4)) * 5
    const D = d + randomInt(15, 40)
    const B = randomInt(12, 30)
    const brand = randomElement(brands)
    
    products.push({
      id: generateId(),
      model,
      brand,
      type: '圆柱滚子轴承',
      category: '滚动轴承',
      innerDiameter: d,
      outerDiameter: D,
      width: B,
      loadRatingDynamic: randomInt(40, 120),
      loadRatingStatic: randomInt(30, 80),
      speedLimit: randomInt(4000, 12000),
      precision: randomElement(precisionGrades),
      sealType: '开放式',
      material: randomElement(materials),
      price: brand === 'SKF' || brand === 'TIMKEN' ? randomInt(100, 350) : randomInt(50, 150),
      stock: randomInt(0, 200),
      description: `${brand} ${model} 圆柱滚子轴承，内径${d}mm，外径${D}mm`,
      imageUrl: '/bearing.svg',
      datasheetUrl: ''
    })
  }

  for (let i = 0; i < 10; i++) {
    const model = randomElement(angularContactModels)
    const d = parseInt(model.slice(2, 4)) * 5
    const D = d + randomInt(10, 25)
    const B = randomInt(10, 20)
    const brand = randomElement(brands)
    
    products.push({
      id: generateId(),
      model,
      brand,
      type: '角接触球轴承',
      category: '滚动轴承',
      innerDiameter: d,
      outerDiameter: D,
      width: B,
      loadRatingDynamic: randomInt(20, 60),
      loadRatingStatic: randomInt(10, 35),
      speedLimit: randomInt(6000, 18000),
      precision: randomElement(precisionGrades),
      sealType: '开放式',
      material: randomElement(materials),
      price: brand === 'SKF' || brand === 'TIMKEN' ? randomInt(70, 250) : randomInt(35, 100),
      stock: randomInt(0, 250),
      description: `${brand} ${model} 角接触球轴承，内径${d}mm，外径${D}mm`,
      imageUrl: '/bearing.svg',
      datasheetUrl: ''
    })
  }

  return products
}

export const mockProducts = generateProducts()
