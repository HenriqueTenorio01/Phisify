export function getAuthErrorMessage(error: unknown): string {
  const rawMessage = error instanceof Error ? error.message.toLowerCase() : ''

  if (!rawMessage) return 'Não foi possível concluir a operação. Tente novamente.'
  if (rawMessage.includes('supabase não está configurado')) {
    return 'A autenticação ainda não foi configurada neste ambiente.'
  }
  if (rawMessage.includes('invalid login credentials')) {
    return 'Senha incorreta ou conta não encontrada.'
  }
  if (rawMessage.includes('email not confirmed')) {
    return 'Confirme seu e-mail antes de entrar.'
  }
  if (rawMessage.includes('user already registered')) {
    return 'Já existe uma conta com este e-mail.'
  }
  if (rawMessage.includes('password should be at least')) {
    return 'Sua senha precisa ter pelo menos 6 caracteres.'
  }
  if (rawMessage.includes('rate limit')) {
    return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.'
  }
  if (rawMessage.includes('network')) {
    return 'Não foi possível conectar ao serviço. Verifique sua internet e tente novamente.'
  }

  return 'Não foi possível concluir a operação. Tente novamente.'
}
