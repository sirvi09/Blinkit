import Swal from 'sweetalert2'

const successAlert = (title)=>{
    const alert = Swal.fire({
        icon : "success",
        title : title,
        confirmButtonColor : "#fff"
    });

    return alert
}

export default successAlert