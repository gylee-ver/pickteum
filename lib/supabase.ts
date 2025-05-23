import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Supabase 클라이언트 생성 시 추가 옵션 설정
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'X-Client-Info': 'pickteum-ui',
    },
  },
  // 브라우저 환경에서만 localStorage 설정 적용
  ...(typeof window !== 'undefined' && {
    localStorage: {
      getItem: (key: string) => {
        return window.localStorage.getItem(key);
      },
      setItem: (key: string, value: string) => {
        window.localStorage.setItem(key, value);
      },
      removeItem: (key: string) => {
        window.localStorage.removeItem(key);
      },
    },
  }),
});

// 안전한 버킷 확인/사용 함수 (인증 필요 없음)
export async function useStorageBucket(bucketName: string) {
  try {
    // 버킷이 존재하는지 확인만 하고 오류가 나면 무시
    try {
      const { data } = await supabase.storage.getBucket(bucketName);
      console.log(`'${bucketName}' 버킷 확인됨:`, data ? '존재함' : '알 수 없음');
    } catch (e) {
      console.log(`'${bucketName}' 버킷 상태 확인 불가 - 계속 진행`);
    }
    
    return {
      upload: async (filePath: string, file: File, options?: any) => {
        try {
          const result = await supabase.storage
            .from(bucketName)
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: true,
              ...options
            });
          
          return result;
        } catch (error: any) {
          console.error('파일 업로드 오류:', error);
          return { data: null, error };
        }
      },
      
      getPublicUrl: (path: string) => {
        return supabase.storage
          .from(bucketName)
          .getPublicUrl(path);
      }
    };
  } catch (e) {
    console.error('스토리지 접근 오류:', e);
    throw new Error('스토리지 접근 불가');
  }
}

// S3 호환 설정 정보 (필요 시 사용)
export const storageConfig = {
  endpoint: 'https://jpdjalmsoooztqvhuzyx.supabase.co/storage/v1',
  region: 'ap-northeast-2',
  accessKeyId: supabaseAnonKey,
  secretAccessKey: supabaseAnonKey,
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
  logger: console
};

export default supabase; 