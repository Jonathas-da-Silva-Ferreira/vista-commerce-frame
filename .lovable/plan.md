# Como entrar como administrador

Nenhuma alteração de código é necessária. O bootstrap admin já está implementado no trigger `handle_new_user()` do banco: **qualquer conta criada com o email `jonathasx.525@gmail.com` recebe automaticamente o papel `admin`** na tabela `user_roles`.

## Passo a passo

1. Abra a rota **`/login`** no preview.
2. Alterne para a aba **"Criar conta" / Sign Up**.
3. Preencha:
   - **Email:** `jonathasx.525@gmail.com`
   - **Senha:** escolha uma senha sua (mín. 6 caracteres)
   - **Nome de exibição:** o que quiser
4. Envie o formulário.
   - O trigger `handle_new_user()` executa no `INSERT` em `auth.users` e cria em paralelo:
     - `profiles` (perfil público)
     - `user_roles` com `role='customer'`
     - `user_roles` com `role='admin'` (só para esse email)
5. Após o signup, o `AuthContext` chama `loadRoles()` e você já entra com `isAdmin === true`.
6. Navegue até **`/admin`** — o `<ProtectedRoute requireRoles={["admin"]}>` libera o acesso.

## Detalhes técnicos (por quê funciona assim)

- **Bootstrap por email fixo:** a promoção está numa função `SECURITY DEFINER` disparada por trigger em `auth.users`. Isso evita expor um endpoint público de "virar admin" e mantém a regra 100% no servidor — o cliente não decide papéis.
- **Papéis em tabela separada (`user_roles`):** nunca no `profiles`. Se estivesse no perfil, um usuário poderia se auto-promover via `UPDATE` no próprio perfil (privilege escalation). A checagem passa pela função `private.has_role()` usada nas RLS policies.
- **Confirmação de email:** se o projeto tiver "Confirm email" ligado em Cloud → Users → Auth Settings, você precisa clicar no link enviado antes que a sessão seja liberada. Para testes rápidos, desative essa opção.
- **Sessão hidratada antes do redirect:** o `ProtectedRoute` espera `loading === false` antes de decidir, então não há flash de `/login` após o signup.

## Se já existir uma conta com esse email sem o papel admin

Isso só acontece se a conta foi criada antes do trigger existir. Nesse caso, rode uma migration com:

```sql
-- Idempotente: ON CONFLICT respeita a UNIQUE(user_id, role).
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE email = 'jonathasx.525@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
```

Me avise se cair nesse caso que eu preparo a migration.

## Boas práticas

- **Troque a senha assim que entrar** — o email de bootstrap é público no código, então a segurança real está na senha que só você conhece.
- **Não use o admin para navegação diária** — crie uma conta cliente separada para testar o fluxo do comprador; assim você não vaza dados de moderação nas telas normais.
- **Depois do MVP, remova o bootstrap por email fixo** do `handle_new_user()` e promova admins manualmente via migration ou via um painel de gestão de papéis. Isso elimina o vetor de "quem controlar o DNS/email um dia poderia recriar a conta".
