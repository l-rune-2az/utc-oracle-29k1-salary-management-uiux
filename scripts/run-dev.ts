import { spawn } from 'child_process';

function startDevServer() {
  console.log('🚀 Đang khởi động Next.js dev server...');

  const devProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true,
  });

  devProcess.on('close', (code) => {
    if (code === 0) {
      console.log('\n✅ Dev server đã dừng bình thường.');
    } else {
      console.error(`\n❌ Dev server dừng với mã lỗi ${code}.`);
    }
    process.exit(code ?? 1);
  });

  devProcess.on('error', (error) => {
    console.error('\n❌ Không thể khởi động dev server:');
    console.error(error);
    process.exit(1);
  });
}

startDevServer();


