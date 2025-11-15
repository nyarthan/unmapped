{
  perSystem =
    { pkgs, ... }:
    {
      formatter = pkgs.writeShellApplication {
        name = "wrapped-nixfmt";
        runtimeInputs = [
          pkgs.nixfmt-rfc-style
          pkgs.fd
        ];
        text = ''
          fd --extension nix --exec nixfmt {}
        '';
      };
    };
}
