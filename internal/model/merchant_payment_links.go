/*
 * MIT License
 *
 * Copyright (c) 2025 linux.do
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

package model

import (
	"time"

	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

type MerchantPaymentLink struct {
	ID               uint64          `json:"id" gorm:"primaryKey;autoIncrement"`
	MerchantAPIKeyID uint64          `json:"merchant_api_key_id" gorm:"not null;index"`
	Token            string          `json:"token" gorm:"size:64;uniqueIndex;not null"`
	Amount           decimal.Decimal `json:"amount" gorm:"type:numeric(20,2);not null"`
	ProductName      string          `json:"product_name" gorm:"size:30;not null"`
	Remark           string          `json:"remark" gorm:"size:100"`
	CreatedAt        time.Time       `json:"created_at" gorm:"autoCreateTime;index"`
	DeletedAt        gorm.DeletedAt  `json:"deleted_at" gorm:"index"`
}

// GetByToken 通过 Token 查询支付链接
func (m *MerchantPaymentLink) GetByToken(tx *gorm.DB, token string) error {
	return tx.Where("token = ?", token).First(m).Error
}
