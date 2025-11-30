/**
 * 更新支付密钥请求
 */
export interface UpdatePayKeyRequest {
  /** 新的支付密钥（6位数字） */
  pay_key: string;
}

/**
 * 用户信息
 */
export interface UserInfo {
  /** 用户 ID */
  id: number;
  /** 用户名 */
  username: string;
  /** 邮箱 */
  email?: string;
}

/**
 * 搜索用户请求
 */
export interface SearchUserRequest {
  /** 用户名 */
  username: string;
}

