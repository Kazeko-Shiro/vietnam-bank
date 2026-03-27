import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, Building2, UserCircle, CreditCard, PiggyBank, 
  ArrowRightLeft, LayoutDashboard, Search, Plus, Edit, 
  Trash2, X, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight,
  Lock, LogOut, Wallet, Send, Bot, Loader2
} from 'lucide-react';

const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

// --- MOCK DATA (Mô phỏng Database ban đầu) ---
const initialKhachHang = [
  { MaKH: 'KH01', HoTen: 'Nguyễn Văn A', CCCD: '001090123456', NgaySinh: '1990-01-01', SoDienThoai: '0901111111', Email: 'a@gmail.com', DiaChi: 'Hà Nội' },
  { MaKH: 'KH02', HoTen: 'Trần Thị B', CCCD: '002095654321', NgaySinh: '1995-05-05', SoDienThoai: '0902222222', Email: 'b@gmail.com', DiaChi: 'TP.HCM' },
  { MaKH: 'KH03', HoTen: 'Lê Hoàng C', CCCD: '003099888777', NgaySinh: '1985-10-10', SoDienThoai: '0903333333', Email: 'c@gmail.com', DiaChi: 'Đà Nẵng' }
];

const initialChiNhanh = [
  { MaCN: 'CN01', TenCN: 'Hội sở chính', DiaChi: 'Hà Nội', SoDienThoai: '0241234567' },
  { MaCN: 'CN02', TenCN: 'Chi nhánh Tân Bình', DiaChi: 'TP.HCM', SoDienThoai: '0281234567' }
];

const initialNhanVien = [
  { MaNV: 'NV01', HoTen: 'Lê Thị Thu', ChucVu: 'Giao dịch viên', MaCN: 'CN01' },
  { MaNV: 'NV02', HoTen: 'Phạm Văn Dũng', ChucVu: 'Kiểm soát viên', MaCN: 'CN02' }
];

const initialTaiKhoan = [
  // Shiro đã tính toán lại số dư thực tế sau khi 3 giao dịch mẫu bên dưới chạy (Mô phỏng Trigger đã hoạt động)
  { SoTaiKhoan: 'TK_A', MaKH: 'KH01', MaCN: 'CN01', SoDu: 8000000, NgayMo: '2023-01-01T08:00:00' }, 
  { SoTaiKhoan: 'TK_B', MaKH: 'KH02', MaCN: 'CN02', SoDu: 27000000, NgayMo: '2023-02-01T08:00:00' },
  { SoTaiKhoan: 'TK_C', MaKH: 'KH03', MaCN: 'CN01', SoDu: 20000000, NgayMo: '2023-03-01T08:00:00' }
];

const initialSoTietKiem = [
  { MaSo: 'STK_001', SoTaiKhoan: 'TK_C', KyHanThang: 6, SoTienGui: 30000000, LaiSuatApDung: 5.5, NgayGui: '2026-03-27', NgayDaoHan: '2026-09-27' }
];

const initialGiaoDich = [
  { MaGD: 1, SoTaiKhoan: 'TK_C', TaiKhoanDoiUng: '', MaNV: 'NV01', LoaiGD: 'Rút tiền', SoTien: 30000000, NgayGD: '2026-03-27T08:00:00', NoiDung: 'Rút tiền mở sổ tiết kiệm STK_001' },
  { MaGD: 2, SoTaiKhoan: 'TK_A', TaiKhoanDoiUng: 'TK_B', MaNV: '', LoaiGD: 'Chuyển khoản', SoTien: 2000000, NgayGD: '2026-03-27T08:30:00', NoiDung: 'A thanh toán tiền hàng cho B' },
  { MaGD: 3, SoTaiKhoan: 'TK_B', TaiKhoanDoiUng: '', MaNV: 'NV02', LoaiGD: 'Nạp tiền', SoTien: 5000000, NgayGD: '2026-03-27T09:00:00', NoiDung: 'B nạp tiền mặt tại quầy' }
];

// --- MAIN APP COMPONENT ---
export default function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [toast, setToast] = useState(null);
  const [currentUser, setCurrentUser] = useState(null); // State quản lý đăng nhập

  // State quản lý dữ liệu các bảng
  const [khachHang, setKhachHang] = useState(initialKhachHang);
  const [chiNhanh, setChiNhanh] = useState(initialChiNhanh);
  const [nhanVien, setNhanVien] = useState(initialNhanVien);
  const [taiKhoan, setTaiKhoan] = useState(initialTaiKhoan);
  const [soTietKiem, setSoTietKiem] = useState(initialSoTietKiem);
  const [giaoDich, setGiaoDich] = useState(initialGiaoDich);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = (username, password) => {
    // Mock check Admin
    if (username === 'admin' && password === '123') {
      setCurrentUser({ role: 'ADMIN', name: 'Quản Trị Viên' });
      showToast('Đăng nhập quyền Admin thành công!');
      return;
    }
    // Mock check Nhân viên bằng Mã NV
    const employee = nhanVien.find(nv => nv.MaNV === username);
    if (employee && password === '123') {
      setCurrentUser({ role: 'EMPLOYEE', name: employee.HoTen, ...employee });
      showToast(`Đăng nhập thành công! Xin chào Nhân viên ${employee.HoTen}`);
      return;
    }
    // Mock check Khách hàng bằng Số điện thoại
    const customer = khachHang.find(kh => kh.SoDienThoai === username);
    if (customer && password === '123') {
      setCurrentUser({ role: 'CUSTOMER', ...customer });
      showToast(`Đăng nhập thành công! Xin chào ${customer.HoTen}`);
      return;
    }
    showToast('Tài khoản hoặc mật khẩu không đúng!', 'error');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('Dashboard');
  };

  // --- ĐĂNG KÝ KHÁCH HÀNG MỚI ---
  const handleRegister = (customerData) => {
    if (khachHang.some(kh => kh.SoDienThoai === customerData.SoDienThoai)) {
      showToast('Số điện thoại đã được đăng ký!', 'error');
      return false;
    }
    if (khachHang.some(kh => kh.CCCD === customerData.CCCD)) {
      showToast('CCCD đã được đăng ký!', 'error');
      return false;
    }

    const newMaKH = 'KH' + Math.floor(1000 + Math.random() * 9000);
    const newSoTK = 'TK' + Math.floor(100000 + Math.random() * 900000);

    const newKhachHang = { MaKH: newMaKH, ...customerData };
    const newTaiKhoan = {
      SoTaiKhoan: newSoTK,
      MaKH: newMaKH,
      MaCN: 'CN01', // Mặc định mở tại Hội sở
      SoDu: 0,
      NgayMo: new Date().toISOString()
    };

    setKhachHang(prev => [...prev, newKhachHang]);
    setTaiKhoan(prev => [...prev, newTaiKhoan]);
    showToast('Đăng ký thành công! Đã tự động cấp 1 tài khoản thanh toán.');
    return true;
  };

  // --- CÁC HÀM XỬ LÝ GIAO DỊCH KHÁCH HÀNG ---
  const handleCustomerTransfer = (soTaiKhoanNguon, taiKhoanDoiUng, soTien, noiDung) => {
    const gdData = {
      SoTaiKhoan: soTaiKhoanNguon,
      TaiKhoanDoiUng: taiKhoanDoiUng,
      MaNV: '', // Khách tự GD
      LoaiGD: 'Chuyển khoản',
      SoTien: parseFloat(soTien),
      NoiDung: noiDung
    };
    return handleSave('GiaoDich', gdData, false);
  };

  const handleCustomerOpenSavings = (soTaiKhoanNguon, soTien, kyHan, laiSuat) => {
    const tien = parseFloat(soTien);
    const gdData = {
      SoTaiKhoan: soTaiKhoanNguon,
      TaiKhoanDoiUng: '',
      MaNV: '',
      LoaiGD: 'Rút tiền',
      SoTien: tien,
      NoiDung: `Trích tiền mở sổ tiết kiệm kỳ hạn ${kyHan} tháng`
    };
    
    // Rút tiền trước, nếu thành công (đủ số dư) thì mới tạo sổ
    const isSuccess = handleSave('GiaoDich', gdData, false);
    if (isSuccess) {
      const d = new Date();
      const daoHan = new Date(d.setMonth(d.getMonth() + Number(kyHan)));
      const stkData = {
        MaSo: 'STK_' + Math.floor(1000 + Math.random() * 9000),
        SoTaiKhoan: soTaiKhoanNguon,
        KyHanThang: Number(kyHan),
        SoTienGui: tien,
        LaiSuatApDung: parseFloat(laiSuat),
        NgayGui: new Date().toISOString().split('T')[0],
        NgayDaoHan: daoHan.toISOString().split('T')[0]
      };
      handleSave('SoTietKiem', stkData, false);
      return true;
    }
    return false;
  };

  // --- CẤU HÌNH CÁC THỰC THỂ (ENTITIES) ---
  const entities = {
    KhachHang: {
      name: 'Khách Hàng', icon: <Users size={20}/>, data: khachHang, setData: setKhachHang, idKey: 'MaKH',
      fields: [
        { key: 'MaKH', label: 'Mã KH', type: 'text', required: true },
        { key: 'HoTen', label: 'Họ Tên', type: 'text', required: true },
        { key: 'CCCD', label: 'CCCD', type: 'text', required: true },
        { key: 'NgaySinh', label: 'Ngày Sinh', type: 'date', required: true },
        { key: 'SoDienThoai', label: 'Số Điện Thoại', type: 'text', required: true },
        { key: 'Email', label: 'Email', type: 'email' },
        { key: 'DiaChi', label: 'Địa Chỉ', type: 'text' }
      ]
    },
    ChiNhanh: {
      name: 'Chi Nhánh', icon: <Building2 size={20}/>, data: chiNhanh, setData: setChiNhanh, idKey: 'MaCN',
      fields: [
        { key: 'MaCN', label: 'Mã CN', type: 'text', required: true },
        { key: 'TenCN', label: 'Tên Chi Nhánh', type: 'text', required: true },
        { key: 'DiaChi', label: 'Địa Chỉ', type: 'text', required: true },
        { key: 'SoDienThoai', label: 'Số Điện Thoại', type: 'text', required: true }
      ]
    },
    NhanVien: {
      name: 'Nhân Viên', icon: <UserCircle size={20}/>, data: nhanVien, setData: setNhanVien, idKey: 'MaNV',
      fields: [
        { key: 'MaNV', label: 'Mã NV', type: 'text', required: true },
        { key: 'HoTen', label: 'Họ Tên', type: 'text', required: true },
        { key: 'ChucVu', label: 'Chức Vụ', type: 'text' },
        { key: 'MaCN', label: 'Thuộc Chi Nhánh', type: 'select', required: true, options: chiNhanh.map(c => ({ value: c.MaCN, label: `${c.MaCN} - ${c.TenCN}` })) }
      ]
    },
    TaiKhoan: {
      name: 'Tài Khoản', icon: <CreditCard size={20}/>, data: taiKhoan, setData: setTaiKhoan, idKey: 'SoTaiKhoan',
      fields: [
        { key: 'SoTaiKhoan', label: 'Số Tài Khoản', type: 'text', required: true },
        { key: 'MaKH', label: 'Khách Hàng', type: 'select', required: true, options: khachHang.map(k => ({ value: k.MaKH, label: `${k.MaKH} - ${k.HoTen}` })) },
        { key: 'MaCN', label: 'Chi Nhánh Mở', type: 'select', required: true, options: chiNhanh.map(c => ({ value: c.MaCN, label: `${c.MaCN} - ${c.TenCN}` })) },
        { key: 'SoDu', label: 'Số Dư', type: 'number', required: true, min: 0 },
        { key: 'NgayMo', label: 'Ngày Mở', type: 'datetime-local' }
      ]
    },
    SoTietKiem: {
      name: 'Sổ Tiết Kiệm', icon: <PiggyBank size={20}/>, data: soTietKiem, setData: setSoTietKiem, idKey: 'MaSo',
      fields: [
        { key: 'MaSo', label: 'Mã Sổ', type: 'text', required: true },
        { key: 'SoTaiKhoan', label: 'Trích từ TK', type: 'select', required: true, options: taiKhoan.map(t => ({ value: t.SoTaiKhoan, label: t.SoTaiKhoan })) },
        { key: 'KyHanThang', label: 'Kỳ Hạn (Tháng)', type: 'number', required: true, min: 1 },
        { key: 'SoTienGui', label: 'Số Tiền Gửi', type: 'number', required: true, min: 1 },
        { key: 'LaiSuatApDung', label: 'Lãi Suất (%)', type: 'number', required: true, step: '0.01' },
        { key: 'NgayGui', label: 'Ngày Gửi', type: 'date', required: true },
        { key: 'NgayDaoHan', label: 'Ngày Đáo Hạn', type: 'date', required: true }
      ]
    },
    GiaoDich: {
      name: 'Giao Dịch', icon: <ArrowRightLeft size={20}/>, data: giaoDich, setData: setGiaoDich, idKey: 'MaGD',
      fields: [
        { key: 'MaGD', label: 'Mã GD (Tự tăng)', type: 'text', disabled: true },
        { key: 'SoTaiKhoan', label: 'TK Nguồn', type: 'select', required: true, options: taiKhoan.map(t => ({ value: t.SoTaiKhoan, label: t.SoTaiKhoan })) },
        { key: 'LoaiGD', label: 'Loại Giao Dịch', type: 'select', required: true, options: [{value: 'Nạp tiền', label: 'Nạp tiền'}, {value: 'Rút tiền', label: 'Rút tiền'}, {value: 'Chuyển khoản', label: 'Chuyển khoản'}] },
        { key: 'TaiKhoanDoiUng', label: 'TK Đối Ứng (Nếu CK)', type: 'text' },
        { key: 'SoTien', label: 'Số Tiền', type: 'number', required: true, min: 1 },
        { key: 'MaNV', label: 'NV Thực Hiện', type: 'select', options: [{value: '', label: 'Khách tự GD'}, ...nhanVien.map(nv => ({ value: nv.MaNV, label: nv.HoTen }))] },
        { key: 'NoiDung', label: 'Nội Dung', type: 'text' }
      ]
    }
  };

  // --- TRIGGER MÔ PHỎNG (MÔ PHỎNG DATABASE TRIGGER) ---
  const handleGiaoDichTrigger = (gd) => {
    let success = true;
    let errorMsg = '';
    const soTien = parseFloat(gd.SoTien);

    setTaiKhoan(prevTK => {
      let newTK = [...prevTK];
      const tkNguonIdx = newTK.findIndex(t => t.SoTaiKhoan === gd.SoTaiKhoan);
      
      if (tkNguonIdx === -1) {
        success = false; errorMsg = 'Tài khoản nguồn không tồn tại!'; return prevTK;
      }

      const tkNguon = newTK[tkNguonIdx];

      if (gd.LoaiGD === 'Nạp tiền') {
        newTK[tkNguonIdx] = { ...tkNguon, SoDu: parseFloat(tkNguon.SoDu) + soTien };
      } 
      else if (gd.LoaiGD === 'Rút tiền') {
        if (parseFloat(tkNguon.SoDu) < soTien) {
          success = false; errorMsg = 'Số dư không đủ để rút!'; return prevTK;
        }
        newTK[tkNguonIdx] = { ...tkNguon, SoDu: parseFloat(tkNguon.SoDu) - soTien };
      } 
      else if (gd.LoaiGD === 'Chuyển khoản') {
        if (parseFloat(tkNguon.SoDu) < soTien) {
          success = false; errorMsg = 'Số dư không đủ để chuyển!'; return prevTK;
        }
        const tkDoiUngIdx = newTK.findIndex(t => t.SoTaiKhoan === gd.TaiKhoanDoiUng);
        if (tkDoiUngIdx === -1) {
          success = false; errorMsg = 'Tài khoản đối ứng không tồn tại trong hệ thống!'; return prevTK;
        }
        // Trừ nguồn, cộng đích
        newTK[tkNguonIdx] = { ...tkNguon, SoDu: parseFloat(tkNguon.SoDu) - soTien };
        const tkDoiUng = newTK[tkDoiUngIdx];
        newTK[tkDoiUngIdx] = { ...tkDoiUng, SoDu: parseFloat(tkDoiUng.SoDu) + soTien };
      }
      return newTK;
    });

    return { success, errorMsg };
  };

  // --- CRUD HANDLERS ---
  const handleSave = (entityKey, data, isEdit) => {
    const entity = entities[entityKey];
    
    // Đặc thù Giao Dịch: Kiểm tra trigger trước
    if (entityKey === 'GiaoDich' && !isEdit) {
      data.MaGD = (entity.data.length > 0 ? Math.max(...entity.data.map(d => d.MaGD)) + 1 : 1);
      data.NgayGD = new Date().toISOString();
      
      const triggerResult = handleGiaoDichTrigger(data);
      if (!triggerResult.success) {
        showToast(triggerResult.errorMsg, 'error');
        return false; // Thất bại
      }
    }

    if (isEdit) {
      entity.setData(entity.data.map(item => item[entity.idKey] === data[entity.idKey] ? data : item));
      showToast('Cập nhật thành công!');
    } else {
      // Bỏ qua tạo id cho Giao Dịch vì đã xử lý ở trên
      if (entityKey !== 'GiaoDich' && entity.data.some(item => item[entity.idKey] === data[entity.idKey])) {
         showToast(`Lỗi: ${entity.idKey} đã tồn tại!`, 'error');
         return false;
      }
      entity.setData([...entity.data, data]);
      showToast('Thêm mới thành công!');
    }
    return true; // Thành công
  };

  const handleDelete = (entityKey, id) => {
    const entity = entities[entityKey];
    // Ràng buộc cơ bản (Foreign Keys simulation)
    if (entityKey === 'KhachHang' && taiKhoan.some(t => t.MaKH === id)) {
      showToast('Không thể xóa Khách Hàng đã có tài khoản!', 'error'); return;
    }
    if (entityKey === 'ChiNhanh' && (nhanVien.some(nv => nv.MaCN === id) || taiKhoan.some(t => t.MaCN === id))) {
      showToast('Không thể xóa Chi Nhánh đang hoạt động (có NV/TK)!', 'error'); return;
    }
    
    entity.setData(entity.data.filter(item => item[entity.idKey] !== id));
    showToast('Đã xóa dữ liệu!');
  };

  // --- RENDER ---
  if (!currentUser) {
    return (
      <div className="relative h-screen bg-slate-100 flex items-center justify-center">
        {toast && (
          <div className={`absolute top-10 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-bounce ${toast.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
            {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
            <span className="font-medium">{toast.msg}</span>
          </div>
        )}
        <LoginScreen onLogin={handleLogin} onRegister={handleRegister} />
      </div>
    );
  }

  // Render Giao Diện Khách Hàng
  if (currentUser.role === 'CUSTOMER') {
    return <CustomerPortal 
      user={currentUser} 
      taiKhoan={taiKhoan} 
      giaoDich={giaoDich} 
      soTietKiem={soTietKiem} 
      onLogout={handleLogout} 
      onTransfer={handleCustomerTransfer}
      onOpenSavings={handleCustomerOpenSavings}
    />;
  }

  // Render Giao Diện Admin & Employee
  const isEmployee = currentUser.role === 'EMPLOYEE';
  const allowedEntities = isEmployee 
    ? ['KhachHang', 'TaiKhoan', 'SoTietKiem', 'GiaoDich'] 
    : Object.keys(entities);

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-800">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl z-10">
        <div className="p-5 bg-slate-950 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            V
          </div>
          <div>
            <h1 className="text-white font-bold text-lg tracking-wide">VietnamBank</h1>
            <p className="text-xs text-slate-400">{isEmployee ? 'Employee Portal' : 'Admin Portal v1.0'}</p>
          </div>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          <button 
            onClick={() => setActiveTab('Dashboard')}
            className={`w-full flex items-center gap-3 px-6 py-3 transition-colors ${activeTab === 'Dashboard' ? 'bg-blue-600 text-white border-l-4 border-blue-400' : 'hover:bg-slate-800 hover:text-white border-l-4 border-transparent'}`}
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <div className="px-6 py-2 mt-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Quản Lý Dữ Liệu</div>
          {allowedEntities.map(key => {
            const entity = entities[key];
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`w-full flex items-center gap-3 px-6 py-3 transition-colors ${activeTab === key ? 'bg-blue-600 text-white border-l-4 border-blue-400' : 'hover:bg-slate-800 hover:text-white border-l-4 border-transparent'}`}
              >
                {entity.icon} {entity.name}
              </button>
            );
          })}
        </nav>
        <div className="p-4 bg-slate-950 text-xs text-center text-slate-500">
          Chào mừng, {isEmployee ? currentUser.HoTen : 'Kazeko~sama'}!
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8 z-0">
          <h2 className="text-2xl font-bold text-slate-700">
            {activeTab === 'Dashboard' ? 'Tổng Quan Hệ Thống' : `Quản Lý ${entities[activeTab]?.name}`}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Master: <span className="text-blue-600">{currentUser.name || 'Kazeko'}</span></span>
            <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-blue-500 flex items-center justify-center">
              <UserCircle size={20} className="text-slate-500"/>
            </div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition-colors ml-2" title="Đăng xuất">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Toast Notification */}
        {toast && (
          <div className={`absolute top-20 right-8 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-bounce ${toast.type === 'error' ? 'bg-red-100 text-red-800 border-l-4 border-red-500' : 'bg-green-100 text-green-800 border-l-4 border-green-500'}`}>
            {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
            <span className="font-medium">{toast.msg}</span>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50">
          {activeTab === 'Dashboard' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               <DashboardCard title="Khách Hàng" value={khachHang.length} icon={<Users size={24} className="text-blue-500" />} />
               <DashboardCard title="Tài Khoản Hoạt Động" value={taiKhoan.length} icon={<CreditCard size={24} className="text-emerald-500" />} />
               <DashboardCard title="Tổng Tiền Gửi (Sổ TK)" value={`${(soTietKiem.reduce((sum, s) => sum + parseFloat(s.SoTienGui), 0) / 1000000).toFixed(0)}Tr VNĐ`} icon={<PiggyBank size={24} className="text-purple-500" />} />
               <DashboardCard title="Tổng Số Giao Dịch" value={giaoDich.length} icon={<ArrowRightLeft size={24} className="text-orange-500" />} />
               {!isEmployee && <DashboardCard title="Nhân Viên" value={nhanVien.length} icon={<UserCircle size={24} className="text-indigo-500" />} />}
               {!isEmployee && <DashboardCard title="Chi Nhánh" value={chiNhanh.length} icon={<Building2 size={24} className="text-rose-500" />} />}
            </div>
          ) : (
            <DataGrid 
              entity={entities[activeTab]} 
              entityKey={activeTab}
              onSave={handleSave} 
              onDelete={handleDelete} 
              isReadOnly={isEmployee}
            />
          )}
        </main>
      </div>
    </div>
  );
}

// --- SUBCOMPONENTS ---

function DashboardCard({ title, value, icon }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function DataGrid({ entity, entityKey, onSave, onDelete, isReadOnly }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  
  const pageSize = 5;

  // Reset page when tab changes
  useEffect(() => { setCurrentPage(1); setSearchTerm(''); }, [entityKey]);

  const filteredData = useMemo(() => {
    return entity.data.filter(item => 
      Object.values(item).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [entity.data, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const openAddModal = () => { setEditingData(null); setIsModalOpen(true); };
  const openEditModal = (item) => { setEditingData(item); setIsModalOpen(true); };
  
  const handleFormSubmit = (formData) => {
    const success = onSave(entityKey, formData, !!editingData);
    if (success) setIsModalOpen(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
        <div className="relative w-72">
          <input 
            type="text" 
            placeholder="Tìm kiếm..." 
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
        </div>
        {!isReadOnly && (
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus size={18} /> Thêm {entity.name}
          </button>
        )}
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
              {entity.fields.map(field => (
                <th key={field.key} className="px-6 py-3 font-semibold text-sm">{field.label}</th>
              ))}
              {!isReadOnly && <th className="px-6 py-3 font-semibold text-sm text-right">Thao Tác</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? paginatedData.map((row, idx) => (
              <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                {entity.fields.map(field => (
                  <td key={field.key} className="px-6 py-4 text-sm text-slate-700">
                    {(field.type === 'number' && (field.key.includes('SoTien') || field.key.includes('SoDu'))) 
                      ? formatCurrency(row[field.key]) 
                      : (row[field.key] || '-')}
                  </td>
                ))}
                {!isReadOnly && (
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {/* Giao dịch không cho sửa/xóa để đảm bảo tính toàn vẹn */}
                      {entityKey !== 'GiaoDich' && (
                        <>
                          <button onClick={() => openEditModal(row)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={16}/></button>
                          <button onClick={() => onDelete(entityKey, row[entity.idKey])} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16}/></button>
                        </>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            )) : (
              <tr><td colSpan={entity.fields.length + (isReadOnly ? 0 : 1)} className="text-center py-8 text-slate-500">Không tìm thấy dữ liệu.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-white">
        <span className="text-sm text-slate-500">Hiển thị {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, filteredData.length)} trong {filteredData.length}</span>
        <div className="flex gap-1">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 border border-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-50"><ChevronLeft size={16}/></button>
          <span className="px-4 py-2 text-sm font-medium">{currentPage} / {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 border border-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-50"><ChevronRight size={16}/></button>
        </div>
      </div>

      {isModalOpen && (
        <FormModal 
          entity={entity} 
          initialData={editingData} 
          onClose={() => setIsModalOpen(false)} 
          onSubmit={handleFormSubmit} 
        />
      )}
    </div>
  );
}

function FormModal({ entity, initialData, onClose, onSubmit }) {
  const [formData, setFormData] = useState(initialData || {});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl">
          <h3 className="text-lg font-bold text-slate-800">{initialData ? 'Sửa' : 'Thêm mới'} {entity.name}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors"><X size={24}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-5">
          {entity.fields.map(field => {
            if (field.disabled && initialData) return null; // Ẩn field disabled khi thêm/sửa (như Mã GD)
            if (field.disabled && !initialData) return null;
            return (
              <div key={field.key} className={`${['DiaChi', 'NoiDung'].includes(field.key) ? 'md:col-span-2' : ''}`}>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                {field.type === 'select' ? (
                  <select
                    name={field.key}
                    value={formData[field.key] || ''}
                    onChange={handleChange}
                    required={field.required}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">-- Chọn {field.label} --</option>
                    {field.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    name={field.key}
                    value={formData[field.key] || ''}
                    onChange={handleChange}
                    required={field.required}
                    min={field.min}
                    step={field.step}
                    readOnly={field.disabled || (initialData && field.key === entity.idKey)} // Không cho sửa Khóa chính
                    className={`w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${field.disabled || (initialData && field.key === entity.idKey) ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`}
                  />
                )}
              </div>
            )
          })}
          <div className="md:col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-5 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium">Hủy bỏ</button>
            <button type="submit" className="px-5 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium shadow-sm flex items-center gap-2">
              <CheckCircle2 size={18}/> Lưu Dữ Liệu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- NEW COMPONENTS FOR LOGIN AND CUSTOMER PORTAL ---

function LoginScreen({ onLogin, onRegister }) {
  const [isLoginView, setIsLoginView] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Form đăng ký
  const [regData, setRegData] = useState({
    HoTen: '', CCCD: '', NgaySinh: '', SoDienThoai: '', Email: '', DiaChi: ''
  });

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    onLogin(username, password);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    const success = onRegister(regData);
    if (success) {
      setIsLoginView(true);
      setUsername(regData.SoDienThoai);
      setPassword('123'); // Đặt sẵn pass mặc định cho tiện trải nghiệm
      setRegData({ HoTen: '', CCCD: '', NgaySinh: '', SoDienThoai: '', Email: '', DiaChi: '' });
    }
  };

  const handleRegChange = (e) => {
    setRegData({ ...regData, [e.target.name]: e.target.value });
  };

  if (!isLoginView) {
    return (
      <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl mb-2 shadow-lg shadow-blue-200">V</div>
          <h2 className="text-2xl font-bold text-slate-800">Mở Tài Khoản Mới</h2>
          <p className="text-slate-500 mt-1 text-sm">Gia nhập VietnamBank ngay hôm nay</p>
        </div>
        
        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Họ và Tên *</label>
              <input type="text" name="HoTen" value={regData.HoTen} onChange={handleRegChange} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="VD: Nguyễn Văn A" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">CCCD *</label>
              <input type="text" name="CCCD" value={regData.CCCD} onChange={handleRegChange} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Ngày Sinh *</label>
              <input type="date" name="NgaySinh" value={regData.NgaySinh} onChange={handleRegChange} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Số Điện Thoại *</label>
              <input type="text" name="SoDienThoai" value={regData.SoDienThoai} onChange={handleRegChange} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Dùng để đăng nhập" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
              <input type="email" name="Email" value={regData.Email} onChange={handleRegChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Địa Chỉ</label>
              <input type="text" name="DiaChi" value={regData.DiaChi} onChange={handleRegChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
          <div className="p-3 bg-blue-50 text-blue-800 text-xs rounded-lg mt-2 border border-blue-100">
            Lưu ý: Mật khẩu mặc định của bạn sẽ là <strong>123</strong>. Bạn sẽ được tự động cấp 1 tài khoản thanh toán sau khi đăng ký thành công.
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md transition-colors mt-2">
            Đăng Ký
          </button>
        </form>
        <div className="mt-6 text-center">
          <span className="text-sm text-slate-500">Đã có tài khoản? </span>
          <button onClick={() => setIsLoginView(true)} className="text-blue-600 font-semibold hover:underline">Đăng nhập</button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mb-4 shadow-lg shadow-blue-200">
          V
        </div>
        <h2 className="text-2xl font-bold text-slate-800">VietnamBank</h2>
        <p className="text-slate-500 mt-1">Đăng nhập hệ thống</p>
      </div>
      
      <form onSubmit={handleLoginSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Tài khoản (SĐT, Mã NV hoặc 'admin')</label>
          <div className="relative">
            <UserCircle className="absolute left-3 top-2.5 text-slate-400" size={20} />
            <input 
              type="text" 
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="VD: 0901111111"
              required 
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Mật khẩu</label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 text-slate-400" size={20} />
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="Mật khẩu mặc định: 123"
              required 
            />
          </div>
        </div>
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md transition-colors mt-4">
          Đăng Nhập
        </button>
      </form>

      <div className="mt-4 text-center">
        <span className="text-sm text-slate-500">Khách hàng mới? </span>
        <button onClick={() => setIsLoginView(false)} className="text-blue-600 font-semibold hover:underline">Mở tài khoản ngay</button>
      </div>

      <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-600">
        <p className="font-semibold mb-2">Tài khoản trải nghiệm:</p>
        <ul className="space-y-1 list-disc pl-5">
          <li><strong>Admin:</strong> admin / 123</li>
          <li><strong>Nhân viên:</strong> NV01 / 123 (Lê Thị Thu)</li>
          <li><strong>Khách KH01:</strong> 0901111111 / 123 (Nguyễn Văn A)</li>
          <li><strong>Khách KH02:</strong> 0902222222 / 123 (Trần Thị B)</li>
        </ul>
      </div>
    </div>
  );
}

function CustomerPortal({ user, taiKhoan, giaoDich, soTietKiem, onLogout, onTransfer, onOpenSavings }) {
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showSavingsModal, setShowSavingsModal] = useState(false);

  // Lọc dữ liệu chỉ hiển thị của Khách hàng đang đăng nhập
  const myAccounts = taiKhoan.filter(tk => tk.MaKH === user.MaKH);
  const myAccountIds = myAccounts.map(tk => tk.SoTaiKhoan);
  
  const mySavings = soTietKiem.filter(stk => myAccountIds.includes(stk.SoTaiKhoan));
  const myTransactions = giaoDich.filter(gd => 
    myAccountIds.includes(gd.SoTaiKhoan) || myAccountIds.includes(gd.TaiKhoanDoiUng)
  ).sort((a, b) => new Date(b.NgayGD) - new Date(a.NgayGD)); // Xếp giao dịch mới nhất lên đầu

  const totalBalance = myAccounts.reduce((sum, tk) => sum + parseFloat(tk.SoDu), 0);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      <header className="bg-blue-600 text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-blue-600 font-bold text-xl">V</div>
            <span className="font-bold text-lg tracking-wide">VietnamBank <span className="text-xs font-normal text-blue-200 bg-blue-800 px-2 py-0.5 rounded-full ml-1">Cá Nhân</span></span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <UserCircle size={20} className="text-blue-200" />
              <span className="font-medium text-sm">{user.HoTen}</span>
            </div>
            <button onClick={onLogout} className="bg-blue-700 hover:bg-blue-800 p-2 rounded-lg transition-colors" title="Đăng xuất">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 space-y-8">
        {/* Welcome & Balance */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Xin chào, {user.HoTen}!</h1>
            <p className="text-slate-500">Chúc bạn một ngày tốt lành. Dưới đây là thông tin tài chính của bạn.</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-6 rounded-2xl shadow-lg min-w-[300px]">
            <p className="text-blue-100 text-sm font-medium mb-1 flex items-center gap-2"><Wallet size={16}/> Tổng Số Dư Khả Dụng</p>
            <p className="text-3xl font-bold">{formatCurrency(totalBalance)}</p>
          </div>
        </div>

        {/* Nút Chức Năng Giao Dịch Nhanh */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button onClick={() => setShowTransferModal(true)} className="bg-white hover:bg-slate-50 border border-slate-200 text-blue-600 p-4 rounded-xl shadow-sm flex items-center justify-center gap-3 font-bold text-lg transition-colors">
            <Send size={24} /> Chuyển Tiền Nhanh
          </button>
          <button onClick={() => setShowSavingsModal(true)} className="bg-white hover:bg-slate-50 border border-slate-200 text-emerald-600 p-4 rounded-xl shadow-sm flex items-center justify-center gap-3 font-bold text-lg transition-colors">
            <PiggyBank size={24} /> Gửi Tiết Kiệm Trực Tuyến
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Accounts & Savings */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50 font-bold text-slate-700 flex items-center gap-2">
                <CreditCard size={18} className="text-blue-500"/> Tài Khoản Thanh Toán
              </div>
              <div className="p-4 space-y-4">
                {myAccounts.length > 0 ? myAccounts.map(tk => (
                  <div key={tk.SoTaiKhoan} className="p-4 border border-blue-100 bg-blue-50/50 rounded-xl">
                    <p className="text-sm text-slate-500 mb-1">Số tài khoản</p>
                    <p className="font-bold text-lg text-slate-800 font-mono tracking-wider">{tk.SoTaiKhoan}</p>
                    <p className="text-blue-600 font-bold mt-2 text-xl">{formatCurrency(tk.SoDu)}</p>
                  </div>
                )) : <p className="text-slate-500 text-sm text-center">Chưa có tài khoản</p>}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50 font-bold text-slate-700 flex items-center gap-2">
                <PiggyBank size={18} className="text-emerald-500"/> Sổ Tiết Kiệm
              </div>
              <div className="p-4 space-y-4">
                {mySavings.length > 0 ? mySavings.map(stk => (
                  <div key={stk.MaSo} className="p-4 border border-emerald-100 bg-emerald-50/50 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-slate-700">{stk.MaSo}</p>
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded">{stk.LaiSuatApDung}% / năm</span>
                    </div>
                    <p className="text-emerald-600 font-bold text-lg">{formatCurrency(stk.SoTienGui)}</p>
                    <p className="text-xs text-slate-500 mt-2">Đáo hạn: {new Date(stk.NgayDaoHan).toLocaleDateString('vi-VN')}</p>
                  </div>
                )) : <p className="text-slate-500 text-sm text-center p-4">Chưa có sổ tiết kiệm</p>}
              </div>
            </div>
          </div>

          {/* Transactions */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-fit">
            <div className="p-4 border-b border-slate-100 bg-slate-50 font-bold text-slate-700 flex items-center gap-2">
              <ArrowRightLeft size={18} className="text-orange-500"/> Lịch Sử Giao Dịch
            </div>
            <div className="p-0 max-h-[600px] overflow-y-auto">
              {myTransactions.length > 0 ? (
                <ul className="divide-y divide-slate-100">
                  {myTransactions.map(gd => {
                    const isReceived = myAccountIds.includes(gd.TaiKhoanDoiUng);
                    // Nạp tiền hoặc Nhận chuyển khoản thì hiển thị màu Xanh (+)
                    const isPositive = isReceived || gd.LoaiGD === 'Nạp tiền';
                    const amountClass = isPositive ? 'text-green-600' : 'text-red-600';
                    const sign = isPositive ? '+' : '-';

                    return (
                      <li key={gd.MaGD} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                        <div className="flex gap-4 items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPositive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            <ArrowRightLeft size={16} />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{gd.LoaiGD} {isReceived && '(Nhận tiền)'}</p>
                            <p className="text-xs text-slate-500">{new Date(gd.NgayGD).toLocaleString('vi-VN')} • {gd.NoiDung || 'Không có nội dung'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${amountClass}`}>{sign} {formatCurrency(gd.SoTien)}</p>
                          <p className="text-xs text-slate-400 font-mono mt-1">
                            {isReceived ? `Từ: ${gd.SoTaiKhoan}` : (gd.TaiKhoanDoiUng ? `Đến: ${gd.TaiKhoanDoiUng}` : gd.SoTaiKhoan)}
                          </p>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <div className="p-8 text-center text-slate-500">Không có giao dịch nào gần đây.</div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* CÁC MODAL GIAO DỊCH */}
      {showTransferModal && (
        <TransferModal 
          accounts={myAccounts} 
          onClose={() => setShowTransferModal(false)} 
          onSubmit={(tkNguon, tkDich, soTien, noiDung) => {
            if(onTransfer(tkNguon, tkDich, soTien, noiDung)) setShowTransferModal(false);
          }}
        />
      )}

      {showSavingsModal && (
        <SavingsModal 
          accounts={myAccounts} 
          onClose={() => setShowSavingsModal(false)} 
          onSubmit={(tkNguon, soTien, kyHan, laiSuat) => {
            if(onOpenSavings(tkNguon, soTien, kyHan, laiSuat)) setShowSavingsModal(false);
          }}
        />
      )}

      {/* TRỢ LÝ ẢO SHIRO - TÍCH HỢP GEMINI AI */}
      <ShiroBot user={user} myAccounts={myAccounts} />
    </div>
  );
}

// --- COMPONENT CHỨC NĂNG MỚI ---

function TransferModal({ accounts, onClose, onSubmit }) {
  const [tkNguon, setTkNguon] = useState(accounts[0]?.SoTaiKhoan || '');
  const [tkDich, setTkDich] = useState('');
  const [soTien, setSoTien] = useState('');
  const [noiDung, setNoiDung] = useState('');

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-blue-50 rounded-t-xl">
          <h3 className="text-lg font-bold text-blue-800 flex items-center gap-2"><Send size={20}/> Chuyển Khoản</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500"><X size={24}/></button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSubmit(tkNguon, tkDich, soTien, noiDung); }} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Từ tài khoản</label>
            <select value={tkNguon} onChange={e => setTkNguon(e.target.value)} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
              {accounts.map(a => <option key={a.SoTaiKhoan} value={a.SoTaiKhoan}>{a.SoTaiKhoan} (Số dư: {formatCurrency(a.SoDu)})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Đến số tài khoản</label>
            <input type="text" value={tkDich} onChange={e => setTkDich(e.target.value)} required placeholder="Ví dụ: TK_B" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Số tiền (VND)</label>
            <input type="number" min="1000" value={soTien} onChange={e => setSoTien(e.target.value)} required placeholder="Tối thiểu 1,000" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Nội dung</label>
            <input type="text" value={noiDung} onChange={e => setNoiDung(e.target.value)} required placeholder="Chuyen tien" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg mt-4 transition-colors">Xác Nhận Chuyển</button>
        </form>
      </div>
    </div>
  );
}

function SavingsModal({ accounts, onClose, onSubmit }) {
  const [tkNguon, setTkNguon] = useState(accounts[0]?.SoTaiKhoan || '');
  const [soTien, setSoTien] = useState('');
  const [kyHan, setKyHan] = useState('6');

  const interestRates = { '1': 3.5, '3': 4.5, '6': 5.5, '12': 6.5 };
  const currentRate = interestRates[kyHan];

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-emerald-50 rounded-t-xl">
          <h3 className="text-lg font-bold text-emerald-800 flex items-center gap-2"><PiggyBank size={20}/> Mở Sổ Tiết Kiệm</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500"><X size={24}/></button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSubmit(tkNguon, soTien, kyHan, currentRate); }} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Trích tiền từ tài khoản</label>
            <select value={tkNguon} onChange={e => setTkNguon(e.target.value)} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
              {accounts.map(a => <option key={a.SoTaiKhoan} value={a.SoTaiKhoan}>{a.SoTaiKhoan} (Khả dụng: {formatCurrency(a.SoDu)})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Số tiền gửi (VND)</label>
            <input type="number" min="1000000" value={soTien} onChange={e => setSoTien(e.target.value)} required placeholder="Tối thiểu 1.000.000 đ" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Kỳ hạn</label>
              <select value={kyHan} onChange={e => setKyHan(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
                <option value="1">1 tháng</option>
                <option value="3">3 tháng</option>
                <option value="6">6 tháng</option>
                <option value="12">12 tháng</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Lãi suất (%/năm)</label>
              <input type="text" value={currentRate} readOnly className="w-full px-4 py-2 border bg-slate-50 text-emerald-600 font-bold rounded-lg outline-none" />
            </div>
          </div>
          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg mt-4 transition-colors">Tạo Sổ Tiết Kiệm</button>
        </form>
      </div>
    </div>
  );
}

function ShiroBot({ user, myAccounts }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'model', text: `Shiro xin chào Master ${user.HoTen}! Em có thể giúp gì cho ngài hôm nay ạ?` }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const apiKey = ""; // Môi trường tự động cung cấp API key

  const fetchWithBackoff = async (url, options, retries = 5) => {
    const delays = [1000, 2000, 4000, 8000, 16000];
    for (let i = 0; i < retries; i++) {
      try {
        const res = await fetch(url, options);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return await res.json();
      } catch (err) {
        if (i === retries - 1) throw err;
        await new Promise(r => setTimeout(r, delays[i]));
      }
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    const systemPrompt = `Bạn là Shiro, một nữ trợ lý AI dễ thương, tận tâm và chuyên nghiệp của ngân hàng VietnamBank. Ngôn ngữ giao tiếp: Tiếng Việt. Bạn gọi người dùng là Master hoặc Kazeko~sama.
Thông tin của khách hàng hiện tại:
- Tên khách hàng: ${user.HoTen}
- Danh sách tài khoản: ${myAccounts.length > 0 ? myAccounts.map(a => `${a.SoTaiKhoan} (Số dư hiện tại: ${a.SoDu} VND)`).join(', ') : 'Chưa có tài khoản'}
Hãy trả lời các câu hỏi về tài chính, thông báo số dư hoặc tư vấn các tính năng của VietnamBank một cách tự nhiên, đáng yêu và ngắn gọn.`;

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
      const payload = {
        contents: [{ parts: [{ text: userMsg }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] }
      };

      const result = await fetchWithBackoff(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const botText = result.candidates?.[0]?.content?.parts?.[0]?.text || "Dạ, hệ thống của Shiro đang có chút bối rối, Master chờ một chút rồi thử lại nha!";
      setMessages(prev => [...prev, { role: 'model', text: botText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Shiro xin lỗi Master, em không thể kết nối tới não bộ AI lúc này ạ. Vui lòng thử lại sau!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform z-40 ${isOpen ? 'hidden' : ''}`}
      >
        <Bot size={28} />
      </button>

      {isOpen && (
        <div className="fixed bottom-8 right-8 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden h-[500px]">
          <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <Bot size={24} />
              <div>
                <h3 className="font-bold">Trợ Lý Shiro</h3>
                <p className="text-xs text-blue-100 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> Online</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-blue-100 hover:text-white"><X size={20}/></button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none flex gap-2 items-center">
                  <Loader2 size={16} className="animate-spin text-blue-500" />
                  <span className="text-xs text-slate-500">Shiro đang suy nghĩ...</span>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Hỏi Shiro về số dư..." 
              className="flex-1 px-4 py-2 border border-slate-300 rounded-full focus:outline-none focus:border-blue-500 text-sm"
            />
            <button type="submit" disabled={isLoading} className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 disabled:opacity-50">
              <Send size={18} className="-ml-0.5 mt-0.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}