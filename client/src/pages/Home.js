import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Sunflower, 
  Bell, 
  Smartphone, 
  Zap, 
  Shield, 
  Users,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <Bell className="w-8 h-8 text-sunflower-500" />,
      title: "Thông báo tự động",
      description: "Nhận thông báo ngay khi cây trồng sẵn sàng thu hoạch"
    },
    {
      icon: <Smartphone className="w-8 h-8 text-green-500" />,
      title: "Tích hợp Telegram",
      description: "Nhận thông báo trực tiếp trên Telegram của bạn"
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
      title: "Thời gian thực",
      description: "Theo dõi tiến độ cây trồng và thời gian thu hoạch chính xác"
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-500" />,
      title: "Bảo mật cao",
      description: "Dữ liệu được mã hóa và bảo vệ an toàn"
    }
  ];

  const benefits = [
    "Không bao giờ bỏ lỡ thời điểm thu hoạch",
    "Tối ưu hóa năng suất nông trại",
    "Quản lý nhiều loại cây trồng cùng lúc",
    "Thông báo tùy chỉnh theo nhu cầu"
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center mb-8">
              <Sunflower className="w-20 h-20 text-sunflower-500 animate-bounce-slow" />
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gradient mb-6">
              Sunflower Land
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Hệ thống thông báo thu hoạch thông minh qua Telegram. 
              Không bao giờ bỏ lỡ thời điểm thu hoạch cây trồng của bạn!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn-primary text-lg px-8 py-4">
                  Vào Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn-primary text-lg px-8 py-4">
                    Bắt đầu miễn phí
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                  <Link to="/login" className="btn-outline text-lg px-8 py-4">
                    Đăng nhập
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tính năng nổi bật
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Công nghệ tiên tiến giúp bạn quản lý nông trại hiệu quả
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card text-center hover:shadow-xl transition-shadow duration-300">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-sunflower-50 to-green-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Tại sao chọn chúng tôi?
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  Với hệ thống thông báo thông minh, bạn sẽ không bao giờ bỏ lỡ 
                  cơ hội thu hoạch và tối ưu hóa năng suất nông trại.
                </p>
                
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="relative">
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                  <div className="text-center">
                    <Users className="w-16 h-16 text-sunflower-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Hơn 1000+ người dùng
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Đã tin tưởng và sử dụng dịch vụ của chúng tôi
                    </p>
                    
                    {!isAuthenticated && (
                      <Link to="/register" className="btn-primary">
                        Tham gia ngay
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-sunflower text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Sẵn sàng bắt đầu?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Đăng ký ngay hôm nay và trải nghiệm hệ thống thông báo 
            thu hoạch thông minh nhất cho game Sunflower Land.
          </p>
          
          {!isAuthenticated && (
            <Link to="/register" className="bg-white text-sunflower-600 hover:bg-gray-100 font-semibold py-4 px-8 rounded-lg text-lg transition-colors duration-200 inline-flex items-center">
              Đăng ký miễn phí
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
