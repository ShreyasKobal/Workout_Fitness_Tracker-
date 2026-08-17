import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth/next';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(req) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('nickname')
      .eq('email', session.user.email)
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    return Response.json({ nickname: user?.nickname || '' });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { nickname } = await req.json();

    if (!nickname || nickname.trim().length === 0) {
      return Response.json({ error: 'Nickname cannot be empty' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('users')
      .update({ nickname: nickname.trim() })
      .eq('email', session.user.email)
      .select();

    if (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    return Response.json({
      message: 'Nickname updated',
      nickname: data[0]?.nickname,
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
