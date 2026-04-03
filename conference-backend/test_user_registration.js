/**
 * 用户注册接口测试脚本
 * 这个脚本演示了如何使用新创建的用户注册接口
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

// 测试用户数据
const testUsers = [
  {
    username: 'testuser1',
    password: 'password123', // 包含字母和数字，长度至少6位
    email: 'test1@example.com',
    full_name: '测试用户一',
    phone: '13800138001'
  },
  {
    username: 'testuser2',
    password: 'abc123', // 包含字母和数字，长度至少6位
    email: 'test2@example.com',
    full_name: '测试用户二',
    phone: '13800138002'
  }
];

// 无效的测试数据（用于测试验证）
const invalidTestCases = [
  {
    description: '空用户名',
    data: {
      username: '',
      password: 'password123',
      email: 'empty@example.com'
    },
    expectedError: '用户名不能为空'
  },
  {
    description: '密码太短',
    data: {
      username: 'shortpass',
      password: '123', // 只有3位
      email: 'short@example.com'
    },
    expectedError: '密码至少6个字符'
  },
  {
    description: '密码只有数字',
    data: {
      username: 'numbersonly',
      password: '123456', // 只有数字，没有字母
      email: 'numbers@example.com'
    },
    expectedError: '密码必须同时包含英文字母和数字'
  },
  {
    description: '密码只有字母',
    data: {
      username: 'lettersonly',
      password: 'abcdef', // 只有字母，没有数字
      email: 'letters@example.com'
    },
    expectedError: '密码必须同时包含英文字母和数字'
  },
  {
    description: '无效邮箱',
    data: {
      username: 'invalidemail',
      password: 'password123',
      email: 'not-an-email'
    },
    expectedError: '请输入有效的邮箱地址'
  }
];

async function testUserRegistration() {
  console.log('🚀 开始测试用户注册接口\n');
  
  try {
    // 1. 测试健康检查
    console.log('1. 测试健康检查接口...');
    try {
      const healthResponse = await axios.get(`${API_BASE_URL}/health`);
      console.log(`   ✅ 健康检查成功: ${JSON.stringify(healthResponse.data)}`);
    } catch (error) {
      console.log(`   ❌ 健康检查失败: ${error.message}`);
      console.log('   请确保服务器正在运行: npm run dev');
      return;
    }
    
    // 2. 测试有效用户注册
    console.log('\n2. 测试有效用户注册...');
    for (let i = 0; i < testUsers.length; i++) {
      const user = testUsers[i];
      console.log(`\n   测试用户 ${i + 1}: ${user.username}`);
      
      try {
        // 先检查用户名是否可用
        const checkUsernameResponse = await axios.get(`${API_BASE_URL}/users/check-username`, {
          params: { username: user.username }
        });
        console.log(`   ✅ 用户名检查: ${checkUsernameResponse.data.message}`);
        
        // 注册用户
        const registerResponse = await axios.post(`${API_BASE_URL}/users/register`, user);
        console.log(`   ✅ 注册成功: ${registerResponse.data.message}`);
        console.log(`     用户ID: ${registerResponse.data.data?.id}`);
        
        // 测试登录
        const loginResponse = await axios.post(`${API_BASE_URL}/users/login`, {
          username: user.username,
          password: user.password
        });
        console.log(`   ✅ 登录成功: ${loginResponse.data.message}`);
        
      } catch (error) {
        if (error.response) {
          console.log(`   ❌ 请求失败: ${error.response.data.message}`);
          console.log(`     错误详情: ${JSON.stringify(error.response.data)}`);
        } else {
          console.log(`   ❌ 错误: ${error.message}`);
        }
      }
    }
    
    // 3. 测试无效数据验证
    console.log('\n3. 测试参数验证...');
    for (const testCase of invalidTestCases) {
      console.log(`\n   测试用例: ${testCase.description}`);
      
      try {
        await axios.post(`${API_BASE_URL}/users/register`, testCase.data);
        console.log(`   ❌ 预期失败但成功了`);
      } catch (error) {
        if (error.response) {
          const errorMessage = error.response.data.message;
          console.log(`   ✅ 验证失败（符合预期）: ${errorMessage}`);
          
          if (errorMessage.includes(testCase.expectedError)) {
            console.log(`     错误匹配预期: "${testCase.expectedError}"`);
          } else {
            console.log(`     错误不匹配预期，期望: "${testCase.expectedError}"`);
          }
        } else {
          console.log(`   ❌ 网络错误: ${error.message}`);
        }
      }
    }
    
    // 4. 测试重复注册
    console.log('\n4. 测试重复注册...');
    const duplicateUser = testUsers[0];
    console.log(`   尝试重复注册用户: ${duplicateUser.username}`);
    
    try {
      await axios.post(`${API_BASE_URL}/users/register`, duplicateUser);
      console.log(`   ❌ 重复注册应该失败但成功了`);
    } catch (error) {
      if (error.response) {
        const errorMessage = error.response.data.message;
        console.log(`   ✅ 重复注册失败（符合预期）: ${errorMessage}`);
        
        if (errorMessage.includes('用户名已存在') || errorMessage.includes('邮箱已被注册')) {
          console.log(`     错误类型正确: 重复注册被阻止`);
        }
      } else {
        console.log(`   ❌ 网络错误: ${error.message}`);
      }
    }
    
    console.log('\n🎉 测试完成！');
    console.log('\n📋 用户注册接口总结:');
    console.log('   - 支持完整的参数验证');
    console.log('   - 密码必须包含字母和数字，至少6位');
    console.log('   - 用户名和邮箱唯一性检查');
    console.log('   - 返回标准的JSON响应格式');
    console.log('   - 包含详细的错误提示');
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
  }
}

// 运行测试
testUserRegistration().catch(console.error);

// 提供使用说明
console.log('\n📖 使用说明:');
console.log('1. 首先启动服务器: npm run dev');
console.log('2. 然后运行此测试: node test_user_registration.js');
console.log('\n🔧 接口详情:');
console.log('   - 注册接口: POST /api/users/register');
console.log('   - 登录接口: POST /api/users/login');
console.log('   - 检查用户名: GET /api/users/check-username?username=xxx');
console.log('   - 检查邮箱: GET /api/users/check-email?email=xxx');