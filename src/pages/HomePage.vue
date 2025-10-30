<template>
  <div class="home-page">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-background">
        <div class="gradient-overlay"></div>
        <div class="floating-elements">
          <div class="floating-photo photo-1">📸</div>
          <div class="floating-photo photo-2">✨</div>
          <div class="floating-photo photo-3">🎨</div>
          <div class="floating-photo photo-4">🤖</div>
        </div>
      </div>
      
      <div class="hero-content">
        <div class="hero-badge">
          <span class="badge-icon">🤖</span>
          <span>AI Similarity Matching</span>
        </div>
        
        <h1 class="hero-title">
          Abadikan Momen Terbaik Anda dengan
          <span class="gradient-text">Yourmoments</span>
        </h1>
        
        <p class="hero-subtitle">
          Temukan dan cocokkan foto terbaik dari para fotografer dengan profil Anda. 
          Teknologi AI kami melakukan similarity matching untuk menghadirkan momen berlari, rekreasi outdoor, hingga foto di pantai yang paling sesuai dengan Anda.
        </p>
        
        <div class="hero-actions">
          <router-link to="/register" class="btn btn-primary">
            <span class="btn-icon">🚀</span>
            Mulai Gratis
          </router-link>
          <router-link to="/explore" class="btn btn-secondary">
            <span class="btn-icon">👀</span>
            Jelajahi Galeri
          </router-link>
        </div>
        
        <div class="hero-stats">
          <div class="stat">
            <div class="stat-number">10K+</div>
            <div class="stat-label">Momen Tersimpan</div>
          </div>
          <div class="stat">
            <div class="stat-number">5K+</div>
            <div class="stat-label">Pengguna Puas</div>
          </div>
          <div class="stat">
            <div class="stat-number">99%</div>
            <div class="stat-label">Akurasi Kecocokan</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="features-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Kenapa Yourmoments?</h2>
          <p class="section-subtitle">
            Rasakan pengalaman menemukan foto momen yang paling cocok dengan Anda menggunakan AI
          </p>
        </div>
        
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <div class="icon-wrapper">🤖</div>
            </div>
            <h3>Akurasi Tinggi</h3>
            <p>AI similarity matching mencocokkan foto fotografer dengan profil Anda secara presisi</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <div class="icon-wrapper">⚡</div>
            </div>
            <h3>Mudah & Cepat</h3>
            <p>Proses instan. Temukan momen lari, outdoor, atau pantai hanya dengan beberapa klik</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <div class="icon-wrapper">🎨</div>
            </div>
            <h3>Kualitas Gambar Tinggi</h3>
            <p>Resolusi foto tajam siap pakai untuk simpan, bagikan, atau dicetak</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <div class="icon-wrapper">📱</div>
            </div>
            <h3>Nyaman di Semua Perangkat</h3>
            <p>Antarmuka responsif dan ringan untuk pengalaman terbaik di ponsel maupun desktop</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <div class="icon-wrapper">🔒</div>
            </div>
            <h3>Jaminan Kerahasiaan</h3>
            <p>Foto Anda terenkripsi. Data tidak dibagikan tanpa persetujuan</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <div class="icon-wrapper">💳</div>
            </div>
            <h3>Pembayaran Aman</h3>
            <p>Dukungan pembayaran yang andal untuk transaksi yang tenang</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Photo Showcase Section -->
    <div class="showcase-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Contoh Hasil yang Relevan</h2>
          <p class="section-subtitle">
            Dari aktivitas berlari, rekreasi outdoor, hingga momen di pantai
          </p>
        </div>
        
        <div class="showcase-grid">
          <div class="showcase-item">
            <div class="photo-container">
              <div class="photo-placeholder original">
                <span class="photo-label">Kandidat</span>
                <div class="photo-icon">📷</div>
              </div>
              <div class="arrow">→</div>
              <div class="photo-placeholder enhanced">
                <span class="photo-label">Cocok untuk Anda</span>
                <div class="photo-icon">✨</div>
              </div>
            </div>
            <h4>Momen Berlari</h4>
            <p>AI memilih angle dan gaya yang paling mendekati profil Anda</p>
          </div>
          
          <div class="showcase-item">
            <div class="photo-container">
              <div class="photo-placeholder original">
                <span class="photo-label">Kandidat</span>
                <div class="photo-icon">🏞️</div>
              </div>
              <div class="arrow">→</div>
              <div class="photo-placeholder enhanced">
                <span class="photo-label">Cocok untuk Anda</span>
                <div class="photo-icon">🎨</div>
              </div>
            </div>
            <h4>Rekreasi Outdoor</h4>
            <p>Temukan tone dan suasana yang sesuai preferensi Anda</p>
          </div>
          
          <div class="showcase-item">
            <div class="photo-container">
              <div class="photo-placeholder original">
                <span class="photo-label">Kandidat</span>
                <div class="photo-icon">🍽️</div>
              </div>
              <div class="arrow">→</div>
              <div class="photo-placeholder enhanced">
                <span class="photo-label">Cocok untuk Anda</span>
                <div class="photo-icon">🌟</div>
              </div>
            </div>
            <h4>Momen di Pantai</h4>
            <p>Highlight warna langit dan laut yang paling pas dengan profil Anda</p>
          </div>
        </div>
      </div>
    </div>

    <!-- CTA Section -->
    <div class="cta-section">
      <div class="container">
        <div class="cta-content">
          <h2 class="cta-title">Siap Temukan Momen Terbaik Anda?</h2>
          <p class="cta-subtitle">
            Bergabunglah dengan ribuan pengguna yang sudah menemukan momen paling relevan dengan Yourmoments
          </p>
          <div class="cta-actions">
            <router-link to="/register" class="btn btn-primary btn-large">
              <span class="btn-icon">🚀</span>
              Mulai Gratis
            </router-link>
            <router-link to="/explore" class="btn btn-outline">
              <span class="btn-icon">👀</span>
              Lihat Galeri
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';

const router = useRouter();
const userStore = useUserStore();

onMounted(() => {
  // If user is already logged in, redirect to explore page
  if (userStore.isLoggedIn) {
    router.push('/explore');
  }
});
</script>

<style scoped>
.home-page {
  min-height: 100vh;
}

/* Hero Section */
.hero-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 50%, rgba(240, 147, 251, 0.9) 100%);
}

.floating-elements {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
}

.floating-photo {
  position: absolute;
  font-size: 2rem;
  opacity: 0.1;
  animation: float 6s ease-in-out infinite;
}

.photo-1 {
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.photo-2 {
  top: 30%;
  right: 15%;
  animation-delay: 1.5s;
}

.photo-3 {
  bottom: 30%;
  left: 20%;
  animation-delay: 3s;
}

.photo-4 {
  bottom: 20%;
  right: 10%;
  animation-delay: 4.5s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}

.hero-content {
  position: relative;
  z-index: 3;
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
  color: white;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  margin-bottom: 2rem;
  font-weight: 600;
  font-size: 0.9rem;
}

.badge-icon {
  font-size: 1.2rem;
}

.hero-title {
  font-size: 4rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.gradient-text {
  background: linear-gradient(45deg, #ffd700, #ff6b6b, #4ecdc4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradient-shift 3s ease-in-out infinite;
}

@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.hero-subtitle {
  font-size: 1.3rem;
  margin-bottom: 3rem;
  opacity: 0.95;
  line-height: 1.6;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.hero-actions {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 4rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.btn:hover::before {
  left: 100%;
}

.btn-primary {
  background: white;
  color: #667eea;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.btn-secondary {
  background: transparent;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.8);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: white;
  transform: translateY(-3px);
}

.btn-outline {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-outline:hover {
  background: #667eea;
  color: white;
  transform: translateY(-3px);
}

.btn-large {
  padding: 1.25rem 2.5rem;
  font-size: 1.2rem;
}

.btn-icon {
  font-size: 1.2rem;
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 4rem;
  flex-wrap: wrap;
}

.stat {
  text-align: center;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  background: linear-gradient(45deg, #ffd700, #ff6b6b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
  font-weight: 500;
}

/* Features Section */
.features-section {
  padding: 8rem 2rem;
  background: #f8fafc;
}

.section-header {
  text-align: center;
  margin-bottom: 5rem;
}

.section-title {
  font-size: 3rem;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
}

.section-subtitle {
  font-size: 1.2rem;
  color: #6b7280;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2.5rem;
}

.feature-card {
  background: white;
  padding: 3rem 2rem;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2, #f093fb);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.feature-card:hover::before {
  transform: scaleX(1);
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.icon-wrapper {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  margin: 0 auto 2rem;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.feature-card h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
}

.feature-card p {
  color: #6b7280;
  line-height: 1.6;
  font-size: 1rem;
}

/* Showcase Section */
.showcase-section {
  padding: 8rem 2rem;
  background: white;
}

.showcase-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 3rem;
}

.showcase-item {
  text-align: center;
}

.photo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 2rem;
  background: #f8fafc;
  border-radius: 20px;
  border: 2px dashed #e5e7eb;
}

.photo-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.photo-placeholder.original {
  background: linear-gradient(135deg, #e5e7eb, #d1d5db);
}

.photo-placeholder.enhanced {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.photo-label {
  font-size: 0.7rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.photo-icon {
  font-size: 1.5rem;
}

.arrow {
  font-size: 1.5rem;
  color: #667eea;
  font-weight: bold;
}

.showcase-item h4 {
  font-size: 1.3rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.showcase-item p {
  color: #6b7280;
  line-height: 1.6;
}

/* CTA Section */
.cta-section {
  padding: 8rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
}

.cta-content {
  max-width: 800px;
  margin: 0 auto;
}

.cta-title {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
}

.cta-subtitle {
  font-size: 1.2rem;
  margin-bottom: 3rem;
  opacity: 0.9;
  line-height: 1.6;
}

.cta-actions {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.1rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .btn {
    width: 100%;
    max-width: 300px;
  }
  
  .hero-stats {
    gap: 2rem;
  }
  
  .stat-number {
    font-size: 2rem;
  }
  
  .section-title {
    font-size: 2.5rem;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .showcase-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .photo-container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .arrow {
    transform: rotate(90deg);
  }
  
  .cta-title {
    font-size: 2.5rem;
  }
  
  .cta-actions {
    flex-direction: column;
    align-items: center;
  }
}

@media (max-width: 480px) {
  .hero-content {
    padding: 1rem;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .features-section,
  .showcase-section,
  .cta-section {
    padding: 4rem 1rem;
  }
  
  .feature-card {
    padding: 2rem 1.5rem;
  }
}
</style>
