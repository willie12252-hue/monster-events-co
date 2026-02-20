              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>


      <main>{children}</main>


      <footer className="mt-auto border-t bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid gap-12 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <img src={logo} alt="Logo" className="h-10 w-auto" />
                <div className="font-bold text-xl">怪獸道具工廠</div>
              </div>
              <p className="text-muted-foreground mb-6 max-w-md">
                我們提供全台灣最專業的啟動儀式道具租借與客製化製作服務。從新品發佈會、動土典禮到大型節慶，怪獸道具都是您最強大的執行後盾。
              </p>
              <div className="flex gap-4">
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary underline underline-offset-4">
                  租借條款與細則
                </Link>
              </div>
            </div>


            <div>
              <h3 className="font-bold mb-6 text-foreground/80 uppercase tracking-wider text-sm">快速連結</h3>
              <ul className="space-y-4 text-sm">
                {nav.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-muted-foreground hover:text-primary">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>


            <div>
              <h3 className="font-bold mb-6 text-foreground/80 uppercase tracking-wider text-sm">聯繫方式</h3>
              <ul className="space-y-4 text-sm">
                <li className="flex items-center gap-3 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
<span>新北市中和區國光街112巷23弄24號1樓</span>span></span>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="h-4 w-4" />
<span>02-8228-1181</span>span></span>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="h-4 w-4" />
<span>willie12252@yahoo.com.tw</span>span></span>
                </li>
                <li className="pt-4">
                  <div className="bg-background p-3 rounded-xl border border-primary/10 inline-block">
                    <img src={lineQr} alt="LINE QR" className="h-24 w-24" />
                    <div className="text-[10px] text-center mt-2 font-bold text-primary">掃描加 LINE</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>


          <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
            <div>© 2026 MONSTERS PROPS INC. 版權所有</div>
            <div className="flex gap-6">
              <span>怪獸活動公司出品</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
