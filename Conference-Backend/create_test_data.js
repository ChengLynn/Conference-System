const { getDb } = require('./dist/config/database');

async function createTestData() {
  console.log('开始创建测试数据...');
  
  try {
    const db = await getDb();
    
    // 1. 创建第二个管理员
    console.log('创建第二个管理员...');
    await db.run(
      `INSERT INTO admins (username, password, email, role, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        'manager',
        '$2a$10$N9qo8uLOickgx2ZMRZoMye3Z6g7z8ZJ5J5J5J5J5J5J5J5J5J5J5J', // 密码: manager123
        'manager@example.com',
        'admin',
        new Date().toISOString(),
        new Date().toISOString()
      ]
    );
    
    // 2. 创建会议数据
    console.log('创建会议数据...');
    
    // 会议1: 即将开始的会议
    const conference1 = await db.run(
      `INSERT INTO conferences (
        title, description, start_date, end_date, location,
        max_attendees, current_attendees, status, created_by,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        '2026年海运圈技术峰会',
        '探讨海运行业最新技术发展趋势，分享数字化转型经验',
        '2026-03-15 09:00:00',
        '2026-03-16 18:00:00',
        '上海国际会议中心',
        500,
        120,
        'published',
        1,
        new Date().toISOString(),
        new Date().toISOString()
      ]
    );
    
    const conference1Id = conference1.lastID;
    
    // 会议2: 进行中的会议
    const conference2 = await db.run(
      `INSERT INTO conferences (
        title, description, start_date, end_date, location,
        max_attendees, current_attendees, status, created_by,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        '国际物流与供应链管理论坛',
        '聚焦全球物流供应链管理创新与实践',
        '2026-02-10 09:00:00',
        '2026-02-12 18:00:00',
        '北京国家会议中心',
        300,
        250,
        'published',
        1,
        new Date().toISOString(),
        new Date().toISOString()
      ]
    );
    
    const conference2Id = conference2.lastID;
    
    // 会议3: 草稿状态的会议
    await db.run(
      `INSERT INTO conferences (
        title, description, start_date, end_date, location,
        max_attendees, current_attendees, status, created_by,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        '绿色航运与可持续发展研讨会',
        '探讨航运业环保技术和可持续发展路径',
        '2026-06-20 09:00:00',
        '2026-06-21 18:00:00',
        '深圳会展中心',
        200,
        0,
        'draft',
        1,
        new Date().toISOString(),
        new Date().toISOString()
      ]
    );
    
    // 3. 创建参会者数据
    console.log('创建参会者数据...');
    
    // 为会议1创建参会者
    const attendeesConference1 = [
      ['张三', 'zhangsan@example.com', '13800138001', '中远海运集团', '技术总监', 'confirmed'],
      ['李四', 'lisi@example.com', '13800138002', '马士基航运', '运营经理', 'confirmed'],
      ['王五', 'wangwu@example.com', '13800138003', '地中海航运', '业务主管', 'pending'],
      ['赵六', 'zhaoliu@example.com', '13800138004', '达飞轮船', '市场专员', 'confirmed'],
      ['钱七', 'qianqi@example.com', '13800138005', '长荣海运', '技术经理', 'pending']
    ];
    
    for (const [name, email, phone, company, position, status] of attendeesConference1) {
      await db.run(
        `INSERT INTO attendees (
          conference_id, name, email, phone, company, position,
          registration_date, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          conference1Id,
          name,
          email,
          phone,
          company,
          position,
          new Date().toISOString(),
          status,
          new Date().toISOString(),
          new Date().toISOString()
        ]
      );
    }
    
    // 为会议2创建参会者
    const attendeesConference2 = [
      ['孙八', 'sunba@example.com', '13800138006', '中外运', '物流总监', 'confirmed'],
      ['周九', 'zhoujiu@example.com', '13800138007', '招商局港口', '运营总监', 'confirmed'],
      ['吴十', 'wushi@example.com', '13800138008', '宁波舟山港', '业务经理', 'confirmed'],
      ['郑十一', 'zhengshiyi@example.com', '13800138009', '天津港集团', '市场经理', 'cancelled'],
      ['王十二', 'wangshier@example.com', '13800138010', '青岛港', '技术专家', 'pending']
    ];
    
    for (const [name, email, phone, company, position, status] of attendeesConference2) {
      await db.run(
        `INSERT INTO attendees (
          conference_id, name, email, phone, company, position,
          registration_date, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          conference2Id,
          name,
          email,
          phone,
          company,
          position,
          new Date().toISOString(),
          status,
          new Date().toISOString(),
          new Date().toISOString()
        ]
      );
    }
    
    // 4. 创建图片数据
    console.log('创建图片数据...');
    
    await db.run(
      `INSERT INTO images (
        conference_id, filename, original_name, path, size, mime_type, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        conference1Id,
        'conference1-banner.jpg',
        'banner.jpg',
        '/uploads/images/conference1-banner.jpg',
        1024000,
        'image/jpeg',
        new Date().toISOString()
      ]
    );
    
    await db.run(
      `INSERT INTO images (
        conference_id, filename, original_name, path, size, mime_type, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        conference2Id,
        'conference2-logo.png',
        'logo.png',
        '/uploads/images/conference2-logo.png',
        512000,
        'image/png',
        new Date().toISOString()
      ]
    );
    
    console.log('✅ 测试数据创建完成！');
    console.log('📊 数据统计:');
    console.log('  - 管理员: 2个 (admin, manager)');
    console.log('  - 会议: 3个 (1个即将开始，1个进行中，1个草稿)');
    console.log('  - 参会者: 10个 (5个会议1，5个会议2)');
    console.log('  - 图片: 2张');
    
    // 显示会议详情
    const conferences = await db.all('SELECT id, title, status, current_attendees FROM conferences ORDER BY start_date');
    console.log('\n📅 会议列表:');
    conferences.forEach(conf => {
      console.log(`  - ${conf.title} (ID: ${conf.id}, 状态: ${conf.status}, 参会者: ${conf.current_attendees}人)`);
    });
    
  } catch (error) {
    console.error('❌ 创建测试数据失败:', error);
    process.exit(1);
  }
}

// 运行函数
createTestData().then(() => {
  console.log('\n🎉 所有测试数据已成功插入数据库！');
  process.exit(0);
}).catch(error => {
  console.error('❌ 执行失败:', error);
  process.exit(1);
});