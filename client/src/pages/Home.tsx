import AppPromoBanner from '../components/Home/AppPromoBanner'
import Features from '../components/Home/Features'
import Hero from '../components/Home/Hero'
import Newsletter from '../components/Home/Newsletter'
import PopularProducts from '../components/Home/PopularProducts'
import HomeCategories from '../components/HomeCategories'

const Home = () => {
  return (
    <div className='min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
      <Hero/>
      <Features/>
      <HomeCategories/>
      <PopularProducts/>
      <AppPromoBanner/>
      <Newsletter/>
    </div>
  )
}

export default Home