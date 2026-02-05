const backendUrl = 'http://localhost:3000';

async function enviarFormularioLogin(event) {
    event.preventDefault(); 
    const form = event.target;
    const formData = new FormData(form);
    const dadosFormulario = {
        nome: formData.get('nome-de-guerra'),
        senha: formData.get('senha')
    };
    usuario = await fetch(backendUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosFormulario)
    }).catch(err => {
        console.error('Erro ao enviar o formulário:', err);
    });
    if(usuario.status === 404) {
        alert("Usuário não encontrado ou senha incorreta.");
        return;
    }
    alert("Login realizado com sucesso!");
    window.location.href = 'frontend-inicio-monitor.html';
}