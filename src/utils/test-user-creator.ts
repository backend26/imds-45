import { supabase } from '@/integrations/supabase/client';

export const createTestUser = async () => {
  try {
    // Sign up test editor user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: 'editor@test.com',
      password: 'TestEditor123!',
      options: {
        data: {
          username: 'editor_test',
          display_name: 'Editor Test'
        }
      }
    });

    if (signUpError) {
      console.error('Error creating test user:', signUpError);
      return null;
    }

    console.log('Test user created successfully:', authData.user?.id);
    return authData.user;
  } catch (error) {
    console.error('Error in createTestUser:', error);
    return null;
  }
};

export const createTestPosts = async (userId: string) => {
  try {
    const testPosts = [
      {
        title: 'Inter vs Milan: Derby della Madonnina',
        excerpt: 'Il derby più atteso dell\'anno con due squadre in grande forma',
        content: '<p>Il Derby della Madonnina torna a San Siro con Inter e Milan che si sfidano per la supremazia cittadina...</p>',
        cover_images: ['/assets/images/derby-inter-milan.jpg'],
        author_id: userId,
        category_id: '11111111-1111-1111-1111-111111111111',
        status: 'published',
        published_at: new Date().toISOString(),
        is_hero: true,
        tags: ['calcio', 'serie-a', 'derby']
      },
      {
        title: 'Verstappen domina a Monza',
        excerpt: 'Il campione del mondo mostra la sua superiorità sul circuito italiano',
        content: '<p>Max Verstappen conquista una vittoria spettacolare al Gran Premio d\'Italia...</p>',
        cover_images: ['/assets/images/verstappen-monza.jpg'],
        author_id: userId,
        category_id: '33333333-3333-3333-3333-333333333333',
        status: 'published',
        published_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        is_hero: true,
        tags: ['f1', 'monza', 'verstappen']
      },
      {
        title: 'Sinner agli US Open',
        excerpt: 'Il tennista azzurro supera il primo turno con una prestazione convincente',
        content: '<p>Jannik Sinner avanza agli US Open con una vittoria convincente...</p>',
        cover_images: ['/assets/images/hero-sinner-usopen.jpg'],
        author_id: userId,
        category_id: '22222222-2222-2222-2222-222222222222',
        status: 'published',
        published_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        is_hero: true,
        tags: ['tennis', 'usopen', 'sinner']
      },
      {
        title: 'Lakers vs Warriors: la rivalità continua',
        excerpt: 'Due leggende NBA si preparano a un altro capitolo della loro rivalità',
        content: '<p>Lakers e Warriors si preparano per un\'altra battaglia epica...</p>',
        cover_images: ['/assets/images/lakers-warriors.jpg'],
        author_id: userId,
        category_id: '44444444-4444-4444-4444-444444444444',
        status: 'published',
        published_at: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
        tags: ['basket', 'nba', 'lakers', 'warriors']
      },
      {
        title: 'Chiefs favoriti per il Super Bowl',
        excerpt: 'Kansas City parte come grande favorita per la conquista del titolo',
        content: '<p>I Kansas City Chiefs mostrano una forma smagliante in questo inizio di stagione...</p>',
        cover_images: ['/assets/images/chiefs-superbowl.jpg'],
        author_id: userId,
        category_id: '55555555-5555-5555-5555-555555555555',
        status: 'published',
        published_at: new Date(Date.now() - 14400000).toISOString(), // 4 hours ago
        tags: ['nfl', 'superbowl', 'chiefs']
      }
    ];

    const { data, error } = await supabase
      .from('posts')
      .insert(testPosts);

    if (error) {
      console.error('Error creating test posts:', error);
      return false;
    }

    console.log('Test posts created successfully');
    return true;
  } catch (error) {
    console.error('Error in createTestPosts:', error);
    return false;
  }
};

export const updateUserRole = async (userId: string, role: 'editor' | 'administrator' = 'editor') => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user role:', error);
      return false;
    }

    console.log(`User role updated to ${role}`);
    return true;
  } catch (error) {
    console.error('Error in updateUserRole:', error);
    return false;
  }
};